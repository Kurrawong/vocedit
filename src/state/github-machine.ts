import { assign } from 'xstate'
import { machineSetup } from '@/state/base-machine'
import type { GitHubUser } from '@/github'

export const githubStates = machineSetup.createStateConfig({
  initial: 'checking',
  states: {
    checking: {
      invoke: {
        id: 'check-github-auth',
        src: 'checkGitHubAuth',
        onDone: [
          {
            target: 'authenticated',
            guard: ({ event }) => event.output.isAuthenticated,
            actions: assign({
              githubUser: ({ event }) => event.output.githubUser as GitHubUser,
            }),
          },
          {
            target: 'unauthenticated',
            actions: assign({
              githubUser: null,
            }),
          },
        ],
        onError: {
          target: 'unauthenticated',
        },
      },
    },
    authenticated: {
      initial: 'empty',
      states: {
        profile: {
          on: {
            'integration.github.auth.profile.close': {
              target: 'empty',
            },
          },
        },
        empty: {
          on: {
            'integration.github.auth.profile': {
              target: 'profile',
            },
          },
        },
      },
      on: {
        'integration.github.auth.logout': {
          target: 'unauthenticated',
          actions: () => {
            sessionStorage.removeItem('github_access_token')
          },
        },
      },
    },
    unauthenticated: {
      on: {
        'integration.github.auth': {
          target: 'authenticating',
        },
        'integration.github.checking': {
          target: 'checking',
        },
      },
    },
    authenticating: {
      invoke: {
        id: 'github-sign-in',
        src: 'gitHubSignIn',
      },
    },
  },
})
