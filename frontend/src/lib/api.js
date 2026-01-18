function getDefaultApiUrl() {
  if (import.meta.env.MODE !== 'development') return ''
  if (typeof window === 'undefined') return 'http://localhost:5000'
  const host = window.location.hostname || 'localhost'
  return `${window.location.protocol}//${host}:5000`
}

const envApiUrl = String(import.meta.env.VITE_API_URL || '').trim()
const API_URL = envApiUrl || getDefaultApiUrl()

function getAuthHeader() {
  const token = localStorage.getItem('auth_token') || ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function requestJson(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json() : null

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return data
}

export function apiGet(path) {
  return requestJson('GET', path)
}

export function apiPost(path, body) {
  return requestJson('POST', path, body)
}

export function apiPatch(path, body) {
  return requestJson('PATCH', path, body)
}

export function apiDelete(path) {
  return requestJson('DELETE', path)
}
