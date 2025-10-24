export interface GitHubUser {
  id: number
  login: string
  avatar_url: string
  name?: string | null
  bio?: string | null
  public_repos?: number
  followers?: number
  following?: number
  company?: string | null
  location?: string | null
  blog?: string | null
  twitter_username?: string | null
  html_url: string
  // Additional properties that might be present in the full response
  [key: string]: unknown
}

export interface GitHubAppInstallation {
  id: number
  app_id: number
  account: GitHubUser
  repository_selection: 'all' | 'selected'
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  language?: string | null
  stargazers_count?: number
  updated_at?: string | null
  html_url: string
  clone_url?: string
  owner?: GitHubUser | null
}

export interface GitHubRepositoryFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  type: 'file' | 'dir'
}

export interface GitHubBranch {
  name: string
  commit: GitHubCommit
  protected: boolean
}

interface GitHubCommit {
  sha: string
  url: string
}

export interface GitHubOrganization {
  id: number
  login: string
  avatar_url: string
  description: string | null
  node_id: string
  url: string
  repos_url: string
  events_url: string
  hooks_url: string
  issues_url: string
  members_url: string
  public_members_url: string
}

const APP_ID = import.meta.env.VITE_VOCEDIT_GITHUB_APP_ID
const CLIENT_ID = import.meta.env.VITE_VOCEDIT_GITHUB_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_VOCEDIT_GITHUB_REDIRECT_URI
const GITHUB_TOKEN_ENDPOINT = import.meta.env.VITE_VOCEDIT_GITHUB_TOKEN_ENDPOINT

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
  const expires_in = data.expires_in
  // Set expiry time to current time + token lifetime - 30 minutes buffer
  const expires_at = Date.now() + expires_in * 1000 - 30 * 60 * 1000
  sessionStorage.setItem('github_access_token', data.access_token)
  sessionStorage.setItem('github_access_token_expires_at', expires_at.toString())
  return data.access_token
}

export async function checkGitHubAppInstallation() {
  const accessToken = sessionStorage.getItem('github_access_token')

  if (!accessToken) {
    throw new Error('No GitHub access token found. Please sign in first.')
  }

  try {
    const response = await fetch('https://api.github.com/user/installations', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to check GitHub app installations')
    }

    const installations = await response.json()

    const voceditAppInstalled = installations.installations?.some(
      (installation: { app_id: number }) => installation.app_id === APP_ID,
    )

    if (!voceditAppInstalled) {
      // Redirect to GitHub app installation page
      window.location.href = 'https://github.com/apps/vocedit/installations/new'
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking GitHub app installation:', error)
    throw error
  }
}
