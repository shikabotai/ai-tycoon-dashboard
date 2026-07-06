type ApiImportMetaEnv = {
  VITE_APP_API_BASE?: string
  VITE_PERSONAL_API_BASE?: string
  VITE_COMMAND_API_BASE?: string
}

const env = (import.meta as ImportMeta & { env?: ApiImportMetaEnv }).env
const rawApiBase = (env?.VITE_APP_API_BASE || '').trim()
const rawPersonalApiBase = (env?.VITE_PERSONAL_API_BASE || '').trim()
const rawCommandApiBase = (env?.VITE_COMMAND_API_BASE || '').trim()

function buildApiPath(path: string, rawBase: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`apiPath expected a leading slash, got: ${path}`)
  }

  if (!rawBase) return path
  return `${rawBase.replace(/\/$/, '')}${path}`
}

export function apiPath(path: string): string {
  return buildApiPath(path, rawApiBase)
}

export function personalApiPath(path: string): string {
  return buildApiPath(path, rawPersonalApiBase || rawApiBase)
}

export function commandApiPath(path: string): string {
  return buildApiPath(path, rawCommandApiBase || rawApiBase)
}
