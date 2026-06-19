import { buildApiUrl } from '../config/app.js'
import { postJson } from './api.js'

export function listAdminTemplates(token) {
  return postJson('/api/admin/templates/list', { token })
}

export function getAdminTemplateDetail(token, communityId) {
  return postJson('/api/admin/templates/detail', {
    token,
    community_id: communityId,
  })
}

export function setAdminTemplateStatus(token, payload) {
  return postJson('/api/admin/templates/set-status', {
    token,
    ...payload,
  })
}

function isSupportedTemplateMediaType(contentType) {
  const mediaType = contentType.split(';', 1)[0].trim().toLowerCase()
  return mediaType === 'image/png' || mediaType === 'image/webp'
}

export async function fetchAdminTemplateMediaObjectUrl(token, { uid, project_id, kind }) {
  const response = await fetch(buildApiUrl('/api/admin/templates/media'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      uid,
      project_id,
      kind,
    }),
  })

  const contentType = response.headers.get('content-type') || ''
  if (response.ok && isSupportedTemplateMediaType(contentType)) {
    const blob = await response.blob()
    return {
      ok: true,
      url: URL.createObjectURL(blob),
    }
  }

  let data = {}
  try {
    data = await response.json()
  } catch {
    data = {
      type: 'error',
      message: response.ok ? '图片解析失败' : `请求失败（${response.status}）`,
    }
  }

  return {
    ok: false,
    data,
  }
}
