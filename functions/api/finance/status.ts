import { financeStatusWithData, json } from './_shared'

export const onRequestGet: PagesFunction = async ({ env }) => {
  return json(await financeStatusWithData(env))
}
