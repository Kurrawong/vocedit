const CLIENT_ID = 'Iv23liLBJLbc4eJCCmiI'
const REDIRECT_URI = 'http://localhost:5173/github/auth/callback'
const GITHUB_TOKEN_ENDPOINT = 'http://localhost:7071/api/github/oauth/access_token'

// Generate random string for code verifier
function generateRandomString(length: number) {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

// Create SHA256 hash and base64url encode
async function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64urlEncode(hash)
}

function base64urlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function signIn() {
  // Generate and store code verifier
  const codeVerifier = generateRandomString(32)
  sessionStorage.setItem('code_verifier', codeVerifier)

  // Generate code challenge
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Redirect to GitHub authorization
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'read:user user:email',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  window.location.href = `https://github.com/login/oauth/authorize?${params}`
}

export async function exchangeCodeForToken(code: string) {
  const codeVerifier = sessionStorage.getItem('code_verifier')

  // Exchange authorization code for access token
  const response = await fetch(GITHUB_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get access token')
  }

  const data = await response.json()
  sessionStorage.setItem('github_access_token', data.access_token)
  return data.access_token
}
