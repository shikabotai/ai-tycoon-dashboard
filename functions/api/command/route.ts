import type { BusinessCommandPayload } from '../../../src/server/commandRouteApi'
import { buildBusinessCommandResponse } from '../../../src/server/commandRouteApi'

export const onRequestPost: PagesFunction = async ({ request }) => {
  const payload = await request.json() as BusinessCommandPayload

  return new Response(JSON.stringify(buildBusinessCommandResponse(payload)), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
