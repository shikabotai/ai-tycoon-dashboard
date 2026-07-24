import { createNetWorthSnapshot, decryptToken, isoDate, json, plaidPost, readJson, requireConfigured, supabaseRequest } from './_shared'

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const missing = requireConfigured(env)
  if (missing) return json({ status: 'needs_credentials', missing: missing.missing })

  const payload = await readJson(request) as { connectionId?: string }
  if (!payload.connectionId) return json({ status: 'invalid_request', message: 'Missing connectionId' }, { status: 400 })

  const connectionResult = await supabaseRequest(env, 'GET', `/financial_connections?id=eq.${encodeURIComponent(payload.connectionId)}&limit=1`)
  if (!connectionResult.ok) return json({ status: 'storage_error', detail: connectionResult.data }, { status: 502 })
  const connection = Array.isArray(connectionResult.data) ? connectionResult.data[0] : null
  if (!connection) return json({ status: 'not_found', message: 'Connection not found' }, { status: 404 })

  const accessToken = await decryptToken(env.FINANCE_TOKEN_ENCRYPTION_SECRET || '', connection.access_token_ciphertext)
  const startedAt = new Date().toISOString()
  const job = await supabaseRequest<Array<{ id: string }>>(env, 'POST', '/financial_sync_jobs', {
    connection_id: payload.connectionId,
    owner_user_id: env.FINANCE_OWNER_USER_ID,
    job_type: 'transactions',
    status: 'running',
    cursor_before: connection.metadata?.transaction_sync_cursor || null,
    started_at: startedAt,
  })
  const jobId = job.ok && Array.isArray(job.data) ? job.data[0]?.id : null

  const balances = await plaidPost(env, '/accounts/balance/get', { access_token: accessToken })
  if (!balances.ok) return json({ status: 'provider_error', detail: balances.data }, { status: 502 })

  let accountCount = 0
  const accountIdsByProviderId = new Map<string, string>()
  for (const account of balances.data.accounts || []) {
    const upsert = await supabaseRequest<Array<{ id: string; provider_account_id: string }>>(
      env,
      'POST',
      '/financial_accounts?on_conflict=connection_id,provider_account_id',
      {
        connection_id: payload.connectionId,
        owner_user_id: env.FINANCE_OWNER_USER_ID,
        provider_account_id: account.account_id,
        account_source: 'linked',
        name: account.name || 'Linked account',
        official_name: account.official_name || null,
        mask: account.mask || null,
        type: account.type || 'unknown',
        subtype: account.subtype || null,
        iso_currency_code: account.balances?.iso_currency_code || null,
        current_balance: account.balances?.current ?? null,
        available_balance: account.balances?.available ?? null,
        limit_amount: account.balances?.limit ?? null,
        metadata: { provider: 'plaid' },
      },
      'resolution=merge-duplicates,return=representation',
    )
    const row = upsert.ok && Array.isArray(upsert.data) ? upsert.data[0] : null
    if (row?.provider_account_id && row.id) accountIdsByProviderId.set(row.provider_account_id, row.id)
    accountCount += 1
  }

  let addedTransactions = 0
  let modifiedTransactions = 0
  let removedTransactions = 0
  let nextCursor = connection.metadata?.transaction_sync_cursor || null
  let hasMore = true
  while (hasMore) {
    const transactionBatch = await plaidPost(env, '/transactions/sync', {
      access_token: accessToken,
      ...(nextCursor ? { cursor: nextCursor } : {}),
    })
    if (!transactionBatch.ok) return json({ status: 'provider_error', detail: transactionBatch.data }, { status: 502 })

    for (const transaction of [...(transactionBatch.data.added || []), ...(transactionBatch.data.modified || [])]) {
      const accountId = accountIdsByProviderId.get(transaction.account_id)
      if (!accountId) continue
      await supabaseRequest(
        env,
        'POST',
        '/financial_transactions?on_conflict=provider_transaction_id',
        {
          owner_user_id: env.FINANCE_OWNER_USER_ID,
          account_id: accountId,
          provider_transaction_id: transaction.transaction_id,
          transaction_date: isoDate(transaction.date) || new Date().toISOString().slice(0, 10),
          authorized_date: isoDate(transaction.authorized_date),
          name: transaction.name || 'Transaction',
          merchant_name: transaction.merchant_name || null,
          amount: transaction.amount || 0,
          iso_currency_code: transaction.iso_currency_code || null,
          pending: Boolean(transaction.pending),
          provider_category: transaction.category || [],
          payment_channel: transaction.payment_channel || null,
          metadata: {
            account_owner: transaction.account_owner || null,
            personal_finance_category: transaction.personal_finance_category || null,
          },
        },
        'resolution=merge-duplicates,return=representation',
      )
      if ((transactionBatch.data.added || []).includes(transaction)) addedTransactions += 1
      else modifiedTransactions += 1
    }

    for (const removed of transactionBatch.data.removed || []) {
      await supabaseRequest(env, 'DELETE', `/financial_transactions?provider_transaction_id=eq.${encodeURIComponent(removed.transaction_id)}`, undefined, 'return=minimal')
      removedTransactions += 1
    }

    nextCursor = transactionBatch.data.next_cursor || nextCursor
    hasMore = Boolean(transactionBatch.data.has_more)
  }

  await supabaseRequest(env, 'PATCH', `/financial_connections?id=eq.${encodeURIComponent(payload.connectionId)}`, {
    last_successful_sync_at: new Date().toISOString(),
    last_error: null,
    metadata: {
      ...(connection.metadata || {}),
      transaction_sync_cursor: nextCursor,
    },
  })
  const netWorthSnapshot = await createNetWorthSnapshot(env)
  if (jobId) {
    await supabaseRequest(env, 'PATCH', `/financial_sync_jobs?id=eq.${encodeURIComponent(jobId)}`, {
      status: 'succeeded',
      cursor_after: nextCursor,
      finished_at: new Date().toISOString(),
      metadata: { accounts: accountCount, addedTransactions, modifiedTransactions, removedTransactions, netWorthSnapshot },
    })
  }
  await supabaseRequest(env, 'POST', '/financial_audit_events', {
    owner_user_id: env.FINANCE_OWNER_USER_ID,
    connection_id: payload.connectionId,
    event_type: 'connection.synced',
    actor: 'system',
    summary: `Synced ${accountCount} accounts and ${addedTransactions + modifiedTransactions} transactions.`,
  })

  return json({ status: 'synced', connection_id: payload.connectionId, accounts: accountCount, transactions: addedTransactions + modifiedTransactions, removed: removedTransactions, net_worth_snapshot: netWorthSnapshot })
}
