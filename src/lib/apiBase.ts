type ApiImportMetaEnv = {
  VITE_APP_API_BASE?: string
}

const rawApiBase = (((import.meta as ImportMeta & { env?: ApiImportMetaEnv }).env?.VITE_APP_API_BASE) || '').trim()

export function apiPath(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`apiPath expected a leading slash, got: ${path}`)
  }

  if (!rawApiBase) return path
  return `${rawApiBase.replace(/\/$/, '')}${path}`
}
