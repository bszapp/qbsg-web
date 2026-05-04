import { buildApiUrl } from '../config/app.js'

const AUTH_ERROR_CODES = ['token_missing', 'token_not_found', 'token_invalid']
let _authFailureHandler = null

export function setAuthFailureHandler(fn) {
  console.log('[api] setAuthFailureHandler 已注册:', fn)
  _authFailureHandler = fn
}

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

  // 统一拦截 token 失效，自动清除会话并提示，同时标记已处理避免页面重复 toast
  console.log('[api] postJson 响应 path:', path, '| errorCode:', data.errorCode, '| _authFailureHandler 是否已注册:', !!_authFailureHandler, '| AUTH_ERROR_CODES 命中:', AUTH_ERROR_CODES.includes(data.errorCode))
  if (AUTH_ERROR_CODES.includes(data.errorCode) && _authFailureHandler) {
    console.log('[api] 命中 token 失效，调用 _authFailureHandler')
    _authFailureHandler(data)
    data._authHandled = true
    console.log('[api] _authHandled 已标记')
  } else if (AUTH_ERROR_CODES.includes(data.errorCode) && !_authFailureHandler) {
    console.warn('[api] 命中 token 失效，但 _authFailureHandler 未注册！')
  }

  return data
}