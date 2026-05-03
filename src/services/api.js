import { buildApiUrl } from '../config/app.js'

export function normalizeMessage(payload, fallback = '操作失败，请稍后重试') {
  if (!payload || typeof payload !== 'object') {
    return fallback
  }

  const candidates = [payload.message, payload.msg, payload.error, payload.detail]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return fallback
}

export function looksLikeAuthError(message = '', status) {
  if (status === 401 || status === 403) {
    return true
  }

  return /token|过期|失效|未登录|登录|登陆|认证|授权|expired|unauthori|forbidden|invalid/i.test(message)
}

export async function postJson(path, body = {}) {
  let response

  try {
    response = await fetch(buildApiUrl(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body ?? {}),
    })
  } catch (error) {
    const networkError = new Error('网络异常，请稍后重试')
    networkError.cause = error
    throw networkError
  }

  let data = null

  try {
    data = await response.json()
  } catch {
    if (!response.ok) {
      const requestError = new Error(`请求失败（${response.status}）`)
      requestError.status = response.status
      throw requestError
    }
  }

  if (!data || typeof data !== 'object') {
    data = {}
  }

  data.httpStatus = response.status

  if (!response.ok && !data.message) {
    data.message = `请求失败（${response.status}）`
  }

  return data
}
