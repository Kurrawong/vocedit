import { Octokit } from 'octokit'

export function useOctokit() {
  // TODO: handle token expiration?
  // redirect with state and handle on return
  return new Octokit({ auth: sessionStorage.getItem('github_access_token') })
}
