import { assign } from 'xstate'
import { machineSetup } from '@/state/base-machine'

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
              github: ({ event }) => event.output.github,
            }),
          },
          {
            target: 'unauthenticated',
            actions: assign({
              github: null,
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
