import { assign } from 'xstate'
import { toast } from 'vue-sonner'
import { type NamedNode } from 'n3'
import type { CreateResourceManagerReturn } from '@/types'
import type { Router } from 'vue-router'
import type { GitHubUser } from '@/github'
import { machineSetup } from '@/state/base-machine'
import type { machineSetup as MachineSetup } from '@/state/base-machine'
import { githubStates } from '@/state/github-machine'

/**
 * Creates a state configuration for the project's opened states.
 *
 * @param machineSetup - The setup object to use
 * @param on - Provide event handlers for 'project.close' and 'project.save'
 * @param states - Provide states for 'saving' and 'savingError'
 * @returns A state configuration for the project's opened states
 */
function createOpenedStatesConfig(machineSetup: typeof MachineSetup, on = {}, states = {}) {
  return machineSetup.createStateConfig({
    initial: 'idle',
    on: {
      ...on,
    },
    states: {
      ...states,
      idle: {
        on: {
          'resource.delete': {
            target: 'deleteResourceDialog',
            actions: assign({
              resourceToDelete: ({ event }) => event.resourceIri,
            }),
          },
          'resource.create': [
            {
              target: 'createResourceDialog',
              guard: ({ context }) => !context.resourceManager.isEditing.value,
            },
            {
              guard: () => true,
              actions: () => toast.error('Please stop editing before creating a resource'),
              target: 'idle',
            },
          ],
          'validation.view.report': {
            target: 'validationReport',
          },
        },
      },
      createResourceDialog: {
        tags: ['createResourceDialog'],
        on: {
          'resource.create.confirm': {
            target: 'createResource',
          },
          'resource.create.cancel': {
            target: 'idle',
          },
        },
      },
      createResource: {
        invoke: {
          id: 'create-resource',
          src: 'createResource',
          input: ({ context, event }) => ({
            resourceManager: context.resourceManager,
            data: (
              event as {
                type: 'resource.create.confirm'
                data: { type: NamedNode; iri: NamedNode }
              }
            ).data,
          }),
          onError: {
            target: 'idle',
            actions: ({ event }) => {
              const error = event.error as Error | undefined
              console.error('Create resource error:', error)
              console.error('Error details:', {
                message: error?.message,
                stack: error?.stack,
                cause: (error as Error & { cause?: unknown })?.cause,
              })
              toast.error(`Failed to create resource: ${error?.message || 'Unknown error'}`)
            },
          },
          onDone: {
            target: 'idle',
            actions: [
              () => toast.success('Resource created'),
              ({ context, event }) =>
                context.router.push('/resource?iri=' + event.output.createdResource.iri.value),
            ],
          },
        },
      },
      deleteResourceDialog: {
        tags: ['deleteResourceDialog'],
        on: {
          'resource.delete.confirm': {
            target: 'deleteResource',
          },
          'resource.delete.cancel': {
            target: 'idle',
            actions: assign({
              resourceToDelete: null,
            }),
          },
        },
      },
      deleteResource: {
        invoke: {
          id: 'delete-resource',
          src: 'deleteResource',
          input: ({ context }) => ({
            resourceManager: context.resourceManager,
            resourceIri: context.resourceToDelete!,
          }),
          onError: {
            target: 'idle',
            actions: [
              ({ event }) => {
                const error = event.error as Error | undefined
                console.error('Delete resource error:', error)
                console.error('Error details:', {
                  message: error?.message,
                  stack: error?.stack,
                  cause: (error as Error & { cause?: unknown })?.cause,
                })
                toast.error(`Failed to delete resource: ${error?.message || 'Unknown error'}`)
              },
              assign({
                resourceToDelete: null,
              }),
            ],
          },
          onDone: {
            target: 'idle',
            actions: [
              () => toast.success('Resource deleted'),
              assign({
                resourceToDelete: null,
              }),
              ({ context, event }) => {
                // Check if the deleted resource IRI matches the current route's query parameter
                const currentIri = context.router.currentRoute.value.query.iri as string
                const deletedResourceIri = event.output.deletedResourceIri

                if (currentIri === deletedResourceIri) {
                  context.router.push('/')
                }
              },
            ],
          },
        },
      },
      validationReport: {
        tags: ['validationReport'],
        on: {
          'validation.view.report.close': {
            target: 'idle',
          },
        },
      },
    },
  })
}

export function voceditMachine(appState: {
  resourceManager: CreateResourceManagerReturn
  fileHandle: FileSystemFileHandle | null
  resourceToDelete: NamedNode | null
  router: Router
  githubUser: GitHubUser | null
}) {
  return machineSetup.createMachine({
    id: 'vocedit',
    type: 'parallel',
    context: {
      ...appState,
      savingError: null,
      githubUser: null,
    },
    states: {
      app: {
        id: 'app',
        initial: 'empty',
        states: {
          empty: {
            entry: [({ context }) => context.resourceManager.resetDataGraph('')],
            on: {
              // 'project.new': {
              //   target: 'opened',
              //   actions: () => toast.success('Project created'),
              // },
              'project.open.file': {
                target: 'openingLocalFile',
              },
            },
          },
          openingLocalFile: {
            on: {
              'project.open.file.cancel': {
                target: 'empty',
              },
            },
            invoke: {
              id: 'open-project-file',
              src: 'openProjectFile',
              input: ({ context }) => ({ resourceManager: context.resourceManager }),
              onError: {
                target: 'empty',
                actions: ({ event }) => {
                  const error = event.error as Error | undefined
                  console.error('Open project error:', error)
                  console.error('Error details:', {
                    message: error?.message,
                    stack: error?.stack,
                    cause: (error as Error & { cause?: unknown })?.cause,
                  })

                  if (!error?.message?.includes('aborted')) {
                    toast.error('Failed to open project', {
                      description: error?.message,
                    })
                  }
                },
              },
              onDone: {
                target: 'opened.openedLocalFile',
                actions: [
                  () => toast.success('Project opened'),
                  assign({
                    fileHandle: ({ event }) => event.output.fileHandle,
                  }),
                ],
              },
            },
          },
          opened: {
            initial: 'empty',
            states: {
              empty: {},
              openedLocalFile: createOpenedStatesConfig(
                machineSetup,
                {
                  'project.close': {
                    target: '#app.empty',
                    actions: [
                      () => toast.success('Project closed'),
                      assign({
                        fileHandle: null,
                      }),
                    ],
                  },
                  'project.save': {
                    target: '.saving',
                  },
                },
                {
                  saving: {
                    tags: ['saving'],
                    on: {
                      'project.save.cancel': {
                        target: '.',
                        actions: () => toast.error('Save project cancelled'),
                      },
                    },
                    invoke: {
                      id: 'save-project-file',
                      src: 'saveProjectFile',
                      input: ({
                        context,
                      }: {
                        context: {
                          resourceManager: CreateResourceManagerReturn
                          fileHandle: FileSystemFileHandle | null
                        }
                      }) => ({
                        resourceManager: context.resourceManager,
                        fileHandle: context.fileHandle!,
                      }),
                      onError: {
                        target: 'savingError',
                        actions: assign({
                          savingError: ({ event }) => {
                            const error = event.error as Error | undefined
                            const errorMessage = `Failed to save project file: ${error?.message || 'Unknown error'}`
                            console.error('Save project error:', error)
                            console.error('Error details:', {
                              message: error?.message,
                              stack: error?.stack,
                              cause: (error as Error & { cause?: unknown })?.cause,
                            })
                            return errorMessage
                          },
                        }),
                      },
                      onDone: {
                        target: 'idle',
                        actions: () => toast.success('Project saved successfully'),
                      },
                    },
                  },
                  savingError: {
                    tags: ['savingError'],
                    on: {
                      'project.save.cancel': {
                        target: 'idle',
                        actions: assign({
                          savingError: null,
                        }),
                      },
                    },
                  },
                },
              ),
            },
          },
        },
      },
      // GitHub authentication state (parallel)
      github: githubStates,
    },
  })
}
