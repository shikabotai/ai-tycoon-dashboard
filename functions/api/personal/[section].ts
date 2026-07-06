import { getGeneratedProjectedSection } from '../../../src/generated/projectedSections'

export const onRequestGet: PagesFunction = async ({ params }) => {
  const sectionParam = params.section
  const section = Array.isArray(sectionParam) ? sectionParam[0] : sectionParam

  if (!section) {
    return new Response('Missing section', { status: 400 })
  }

  const data = getGeneratedProjectedSection(section as Parameters<typeof getGeneratedProjectedSection>[0])
  if (!data) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
