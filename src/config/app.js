// 站点部署目录。放根目录就填 '/'，放 /new/ 就填 '/new/'。
export const APP_BASE_PATH = '/'


export function buildApiUrl(path = '') {
  const API_BASE_URL = (location.hostname == 'localhost') ? 'https://qbsg.top' : ''
  if (!API_BASE_URL) {
    return path
  }

  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
  const nextPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${nextPath}`
}
