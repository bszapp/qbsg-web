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
