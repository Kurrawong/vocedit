import { showOpenFilePicker } from 'show-open-file-picker'
import { assign, fromPromise, setup } from 'xstate'
import type { CreateResourceManagerReturn } from '@/types'

export const voceditMachine = (appState: {
  resourceManager: CreateResourceManagerReturn
  fileHandle: FileSystemFileHandle | null
}) =>
  setup({
    types: {
      context: {} as {
        resourceManager: CreateResourceManagerReturn
        fileHandle: FileSystemFileHandle | null
      },
      events: {} as
        | { type: 'project.new' }
        | { type: 'project.open' }
        | { type: 'project.open.file' }
        | { type: 'project.open.file.cancel' }
        | { type: 'project.save' }
        | { type: 'project.save.cancel' }
        | { type: 'project.close' },
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
            actions: () => console.log('start new project'),
          },
          'project.open': {
            target: 'opening',
            actions: () => console.log('open project'),
          },
        },
      },
      opening: {
        on: {
          'project.open.file.cancel': {
            target: 'empty',
            actions: () => console.log('cancel open file'),
          },
        },
        invoke: {
          id: 'open-project-file',
          src: 'openProjectFile',
          input: ({ context }) => ({ resourceManager: context.resourceManager }),
          onError: {
            target: 'empty',
            actions: () => console.log('failed to open project file'),
          },
          onDone: {
            target: 'opened',
            actions: [
              () => console.log('opened project file'),
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
              () => console.log('close project'),
              assign({
                fileHandle: null,
              }),
            ],
          },
          'project.save': {
            target: 'saving',
            actions: () => console.log('save project'),
          },
        },
      },
      saving: {
        on: {
          'project.save.cancel': {
            target: 'opened',
            actions: () => console.log('cancel save project'),
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
            actions: () => console.log('failed to save project file'),
          },
          onDone: {
            target: 'opened',
            actions: () => console.log('saved project file'),
          },
        },
      },
    },
  })
