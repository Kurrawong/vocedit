import { showOpenFilePicker } from 'show-open-file-picker'
import { assign, fromPromise, setup } from 'xstate'
import { toast } from 'vue-sonner'
import type { NamedNode } from 'n3'
import type { CreateResourceManagerReturn } from '@/types'
import type { Router } from 'vue-router'

export const voceditMachine = (appState: {
  resourceManager: CreateResourceManagerReturn
  fileHandle: FileSystemFileHandle | null
  resourceToDelete: NamedNode | null
  router: Router
}) =>
  setup({
    types: {
      context: {} as {
        resourceManager: CreateResourceManagerReturn
        fileHandle: FileSystemFileHandle | null
        resourceToDelete: NamedNode | null
        router: Router
      },
      events: {} as
        | { type: 'project.new' }
        | { type: 'project.open' }
        | { type: 'project.open.file' }
        | { type: 'project.open.file.cancel' }
        | { type: 'project.save' }
        | { type: 'project.save.cancel' }
        | { type: 'project.close' }
        | { type: 'resource.delete'; resourceIri: NamedNode }
        | { type: 'resource.delete.confirm' }
        | { type: 'resource.delete.cancel' },
    },
    guards: {},
    actors: {
      openProjectFile: (() => {
        return fromPromise(
          async ({ input }: { input: { resourceManager: CreateResourceManagerReturn } }) => {
            const filePickerOptions = {
              types: [
                {
                  description: 'Turtle (.ttl)',
                  accept: {
                    'text/turtle': ['.ttl'],
                  },
                },
              ],

              multiple: false,
              excludeAcceptAllOption: true,
            }
            const [fileHandle] = await showOpenFilePicker(filePickerOptions)
            const file = await fileHandle.getFile()
            input.resourceManager.resetDataGraph(await file.text())

            return {
              fileHandle,
            }
          },
        )
      })(),
      saveProjectFile: (() => {
        return fromPromise(
          async ({
            input,
          }: {
            input: {
              resourceManager: CreateResourceManagerReturn
              fileHandle: FileSystemFileHandle
            }
          }) => {
            const writable = await input.fileHandle.createWritable()
            await writable.write(input.resourceManager.dataGraph.value.toString())
            await writable.close()

            return {
              fileHandle: input.fileHandle,
            }
          },
        )
      })(),
      deleteResource: (() => {
        return fromPromise(
          async ({
            input,
          }: {
            input: { resourceManager: CreateResourceManagerReturn; resourceIri: NamedNode }
          }) => {
            input.resourceManager.deleteResource(input.resourceIri)

            return {
              deletedResourceIri: input.resourceIri.value,
            }
          },
        )
      })(),
    },
  }).createMachine({
    id: 'vocedit',
    initial: 'empty',
    context: {
      ...appState,
    },
    states: {
      empty: {
        entry: ({ context }) => context.resourceManager.resetDataGraph(''),
        on: {
          'project.new': {
            target: 'opened',
            actions: () => toast.success('Project created'),
          },
          'project.open': {
            target: 'opening',
          },
        },
      },
      opening: {
        on: {
          'project.open.file.cancel': {
            target: 'empty',
            actions: () => toast.error('Open project cancelled'),
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
            },
          },
          onDone: {
            target: 'opened',
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
        on: {
          'project.close': {
            target: 'empty',
            actions: [
              () => toast.success('Project closed'),
              assign({
                fileHandle: null,
              }),
            ],
          },
          'project.save': {
            target: 'saving',
          },
          'resource.delete': {
            target: 'deleteResourceDialog',
            actions: assign({
              resourceToDelete: ({ event }) => event.resourceIri,
            }),
          },
        },
      },
      deleteResourceDialog: {
        on: {
          'resource.delete.confirm': {
            target: 'deleteResource',
          },
          'resource.delete.cancel': {
            target: 'opened',
            actions: [
              () => toast.message('Delete resource cancelled'),
              assign({
                resourceToDelete: null,
              }),
            ],
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
            target: 'opened',
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
            target: 'opened',
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
      saving: {
        on: {
          'project.save.cancel': {
            target: 'opened',
            actions: () => toast.error('Save project cancelled'),
          },
        },
        invoke: {
          id: 'save-project-file',
          src: 'saveProjectFile',
          input: ({ context }) => ({
            resourceManager: context.resourceManager,
            fileHandle: context.fileHandle!,
          }),
          onError: {
            target: 'opened',
            actions: ({ event }) => {
              const error = event.error as Error | undefined
              console.error('Save project error:', error)
              console.error('Error details:', {
                message: error?.message,
                stack: error?.stack,
                cause: (error as Error & { cause?: unknown })?.cause,
              })
              toast.error(`Failed to save project file: ${error?.message || 'Unknown error'}`)
            },
          },
          onDone: {
            target: 'opened',
            actions: () => toast.success('Project saved successfully'),
          },
        },
      },
    },
  })
