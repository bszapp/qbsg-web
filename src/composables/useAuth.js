import { computed, reactive, readonly } from 'vue'
import { useToast } from './useToast.js'
import { normalizeMessage, postJson, setAuthFailureHandler } from '../services/api.js'

const TOKEN_STORAGE_KEY = 'xfltd_user_token'

const state = reactive({
  token: localStorage.getItem(TOKEN_STORAGE_KEY) || '',
  user: null,
  ready: false,
  bootstrapped: false,
})

function saveToken(token) {
  state.token = token || ''

  if (state.token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, state.token)
    return
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

function clearSession() {
  console.log('[useAuth] clearSession 执行，清除 token 和 user')
  saveToken('')
  state.user = null
  console.log('[useAuth] clearSession 完毕，state.token:', state.token, '| state.user:', state.user)
}

function buildUser(payload = {}) {
  const source = payload.user && typeof payload.user === 'object' ? payload.user : payload
  const username = source.username ?? payload.username ?? state.user?.username ?? ''
  const points = source.points ?? payload.points ?? state.user?.points ?? 0

  return {
    ...source,
    username,
    points,
  }
}

function updateUser(patch = {}) {
  if (!state.user) {
    state.user = buildUser(patch)
    return
  }

  state.user = {
    ...state.user,
    ...patch,
  }
}

// token 相关的 errorCode，命中其中一个才视为鉴权失败并清除会话
const AUTH_ERROR_CODES = ['token_missing', 'token_not_found', 'token_invalid']

// 模块初始化时注册到 api.js，使所有 postJson 请求都能自动拦截 token 失效
console.log('[useAuth] 模块初始化，注册 authFailureHandler')
setAuthFailureHandler((payload) => handleAuthFailure(payload))

function handleAuthFailure(payload, options = {}) {
  console.group('[useAuth] handleAuthFailure 触发')
  console.log('payload.errorCode:', payload?.errorCode)
  console.log('payload._authHandled:', payload?._authHandled)
  console.log('AUTH_ERROR_CODES 命中:', AUTH_ERROR_CODES.includes(payload?.errorCode))
  console.log('当前 state.token:', state.token)

  // 已由 postJson 统一处理过，直接返回 true 让调用方正常 early-return，不重复操作
  if (payload?._authHandled) {
    console.log('→ 已被 postJson 处理过，跳过，返回 true')
    console.groupEnd()
    return true
  }

  if (!AUTH_ERROR_CODES.includes(payload?.errorCode)) {
    console.log('→ errorCode 不在 AUTH_ERROR_CODES 中，返回 false')
    console.groupEnd()
    return false
  }

  const message = normalizeMessage(payload, '登录状态已过期，请重新登录')
  console.log('→ 触发 clearSession，message:', message)
  clearSession()
  console.log('→ clearSession 执行完毕，state.token:', state.token, '| state.user:', state.user)

  if (options.showToast !== false) {
    const { showToast } = useToast()
    showToast(options.authMessage || message || '登录状态已过期，请重新登录', 'warning', 3600)
  }

  console.log('→ handleAuthFailure 完成，返回 true')
  console.groupEnd()
  return true
}

async function refreshProfile(options = {}) {
  const { silent = false, showAuthToast = !silent } = options

  if (!state.token) {
    state.user = null
    state.ready = true
    return null
  }

  try {
    const data = await postJson('/api/user/info', { token: state.token })

    if (data.type === 'success') {
      state.user = buildUser(data)
      state.ready = true
      return state.user
    }

    const handled = handleAuthFailure(data, { showToast: showAuthToast })

    if (!handled && !silent) {
      const { showToast } = useToast()
      showToast(normalizeMessage(data, '获取用户信息失败'), 'error', 3200)
    }

    state.ready = true
    return null
  } catch (error) {
    state.ready = true

    if (!silent) {
      const { showToast } = useToast()
      showToast(error.message || '获取用户信息失败', 'error', 3200)
    }

    return null
  }
}

async function bootstrapAuth() {
  if (state.bootstrapped) {
    return
  }

  state.bootstrapped = true
  state.ready = false

  if (!state.token) {
    state.ready = true
    return
  }

  await refreshProfile({
    silent: true,
    showAuthToast: true,
  })
}

async function login(payload) {
  try {
    const data = await postJson('/api/user/login', payload)

    if (data.type !== 'success') {
      const { showToast } = useToast()
      showToast(normalizeMessage(data, '登录失败，请检查用户名和密码'), 'error', 3400)
      return false
    }

    saveToken(data.token)
    state.user = buildUser({
      ...data,
      username: data.username || payload.username,
    })
    state.ready = true
    await refreshProfile({ silent: true, showAuthToast: false })

    const { showToast } = useToast()
    showToast(normalizeMessage(data, '登录成功'), 'success', 2800)
    return true
  } catch (error) {
    const { showToast } = useToast()
    showToast(error.message || '登录失败，请稍后重试', 'error', 3400)
    return false
  }
}

async function register(payload) {
  try {
    const data = await postJson('/api/user/register', payload)

    if (data.type !== 'success') {
      const { showToast } = useToast()
      showToast(normalizeMessage(data, '注册失败，请稍后重试'), 'error', 3400)
      return false
    }

    saveToken(data.token)
    state.user = buildUser({
      ...data,
      username: data.username || payload.username,
    })
    state.ready = true
    await refreshProfile({ silent: true, showAuthToast: false })

    const { showToast } = useToast()
    showToast(normalizeMessage(data, '注册成功'), 'success', 2800)
    return true
  } catch (error) {
    const { showToast } = useToast()
    showToast(error.message || '注册失败，请稍后重试', 'error', 3400)
    return false
  }
}

async function logout(options = {}) {
  const { silent = false } = options
  const currentToken = state.token

  clearSession()
  state.ready = true

  if (currentToken) {
    try {
      await postJson('/api/user/logout', { token: currentToken })
    } catch {
      // 本地状态已经清空，这里不阻塞退出流程。
    }
  }

  if (!silent) {
    const { showToast } = useToast()
    showToast('已退出登录', 'success', 2600)
  }
}

async function changePassword(payload) {
  try {
    const data = await postJson('/api/user/change-password', {
      token: state.token,
      ...payload,
    })

    if (data.type === 'success') {
      const { showToast } = useToast()
      showToast(normalizeMessage(data, '密码修改成功'), 'success', 2800)
      return true
    }

    if (handleAuthFailure(data)) {
      return false
    }

    const { showToast } = useToast()
    showToast(normalizeMessage(data, '密码修改失败'), 'error', 3400)
    return false
  } catch (error) {
    const { showToast } = useToast()
    showToast(error.message || '密码修改失败，请稍后重试', 'error', 3400)
    return false
  }
}

async function deleteAccount(payload) {
  try {
    const data = await postJson('/api/user/delete', {
      token: state.token,
      ...payload,
    })

    if (data.type === 'success') {
      const { showToast } = useToast()
      showToast(normalizeMessage(data, '账号已注销'), 'success', 3200)
      return true
    }

    const { showToast } = useToast()
    showToast(normalizeMessage(data, '注销账号失败'), 'error', 3400)
    return false
  } catch (error) {
    const { showToast } = useToast()
    showToast(error.message || '注销账号失败，请稍后重试', 'error', 3400)
    return false
  }
}

export function useAuth() {
  return {
    state: readonly(state),
    isAuthenticated: computed(() => Boolean(state.token && state.user?.username)),
    isReady: computed(() => state.ready),
    bootstrapAuth,
    refreshProfile,
    login,
    register,
    logout,
    changePassword,
    deleteAccount,
    updateUser,
    handleAuthFailure,
  }
}