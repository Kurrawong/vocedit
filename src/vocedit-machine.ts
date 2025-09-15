import { showOpenFilePicker } from 'show-open-file-picker'
import { assign, fromPromise, setup } from 'xstate'
import { toast } from 'vue-sonner'
import type { CreateResourceManagerReturn } from '@/types'

export const voceditMachine = (appState: {
  resourceManager: CreateResourceManagerReturn
  fileHandle: FileSystemFileHandle | null
  resourceToDelete: string | null
}) =>
  setup({
    types: {
      context: {} as {
        resourceManager: CreateResourceManagerReturn
        fileHandle: FileSystemFileHandle | null
        resourceToDelete: string | null
      },
      events: {} as
        | { type: 'project.new' }
        | { type: 'project.open' }
        | { type: 'project.open.file' }
        | { type: 'project.open.file.cancel' }
        | { type: 'project.save' }
        | { type: 'project.save.cancel' }
        | { type: 'project.close' }
        | { type: 'resource.delete'; resourceIri: string }
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
            input: { resourceManager: CreateResourceManagerReturn; resourceIri: string }
          }) => {
            // TODO: Implement actual delete logic here
            // Example: await input.resourceManager.deleteResource(input.resourceIri)
            console.log('Invoking deleteResource', input.resourceIri)

            return {
              deletedResourceIri: input.resourceIri,
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
              () => toast.error('Failed to delete resource'),
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
            actions: () => toast.error('Failed to save project file'),
          },
          onDone: {
            target: 'opened',
            actions: () => toast.success('Project saved successfully'),
          },
        },
      },
    },
  })
