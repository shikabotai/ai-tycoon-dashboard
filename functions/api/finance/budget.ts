import { json, readJson, requireConfigured, supabaseRequest } from './_shared'

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const missing = requireConfigured(env)
  if (missing) return json({ status: 'needs_credentials', missing: missing.missing })

  const payload = await readJson(request) as { category?: string; plannedAmount?: number; month?: string; notes?: string }
  const category = payload.category?.trim()
  const plannedAmount = Number(payload.plannedAmount)
  const month = normalizeMonth(payload.month)

  if (!category || !Number.isFinite(plannedAmount) || plannedAmount < 0 || !month) {
    return json({ status: 'invalid_request', message: 'Budget needs category, month, and non-negative plannedAmount.' }, { status: 400 })
  }

  const categoryResult = await supabaseRequest<Array<{ id: string }>>(
    env,
    'POST',
    '/financial_transaction_categories?on_conflict=owner_user_id,name',
    {
      owner_user_id: env.FINANCE_OWNER_USER_ID,
      name: category,
      budget_group: category,
      is_system: false,
    },
    'resolution=merge-duplicates,return=representation',
  )
  if (!categoryResult.ok) return json({ status: 'storage_error', detail: categoryResult.data }, { status: 502 })

  const categoryRow = Array.isArray(categoryResult.data) ? categoryResult.data[0] : null
  if (!categoryRow?.id) return json({ status: 'storage_error', detail: 'Category was not returned.' }, { status: 502 })

  const budgetResult = await supabaseRequest<Array<{ id: string }>>(
    env,
    'POST',
    '/monthly_budgets?on_conflict=owner_user_id,category_id,month',
    {
      owner_user_id: env.FINANCE_OWNER_USER_ID,
      category_id: categoryRow.id,
      month,
      planned_amount: plannedAmount,
      rollover_enabled: false,
      notes: payload.notes?.trim() || null,
    },
    'resolution=merge-duplicates,return=representation',
  )
  if (!budgetResult.ok) return json({ status: 'storage_error', detail: budgetResult.data }, { status: 502 })

  const budgetRow = Array.isArray(budgetResult.data) ? budgetResult.data[0] : null
  return json({ status: 'saved', id: budgetRow?.id })
}

function normalizeMonth(value?: string) {
  const raw = value?.trim() || new Date().toISOString().slice(0, 7)
  if (!/^\d{4}-\d{2}$/.test(raw)) return null
  return `${raw}-01`
}
