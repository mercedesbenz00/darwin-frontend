const url = '{url}'
const base64 = '...'
const body = { image: { base64: base64 } }
const token = 'your-api-key'
const headers = { Authorization: `ApiKey ${token}` }

fetch(url, { method: 'POST', body, headers })
