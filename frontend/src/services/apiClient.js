const API_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL ?? '')

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    let message = `API request failed: ${response.status} ${response.statusText}`
    try {
      const body = await response.json()
      if (body.error || body.message) message = body.error || body.message
    } catch {
      // Keep the HTTP error when the response is not JSON.
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  return response.json()
}

const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) =>
    request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body, options) =>
    request(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  put: (path, body, options) =>
    request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}

export { API_URL, request }
export default apiClient
