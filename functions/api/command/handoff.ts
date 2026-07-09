import type { CommandHandoffPayload } from '../../../src/server/commandHandoffApi'
import { buildCommandHandoffResponse } from '../../../src/server/commandHandoffApi'

export const onRequestPost: PagesFunction = async ({ request }) => {
  const payload = await request.json() as CommandHandoffPayload

  return new Response(JSON.stringify(buildCommandHandoffResponse(payload)), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
