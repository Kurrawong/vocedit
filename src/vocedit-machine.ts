import { showOpenFilePicker } from 'show-open-file-picker'
import { assign, fromPromise, setup } from 'xstate'
import n3 from 'n3'

export const voceditMachine = setup({
  types: {
    context: {} as {
      fileHandle: FileSystemFileHandle | null
      dataStore: n3.Store | null
    },
    events: {} as
      | { type: 'project.new' }
      | { type: 'project.open' }
      | { type: 'project.open.file' }
      | { type: 'project.open.file.cancel' }
      | { type: 'project.close' },
  },
  guards: {},
  actors: {
    openProjectFile: (() => {
      return fromPromise(async () => {
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

        const parser = new n3.Parser({ format: 'text/turtle' })
        const quads = parser.parse(await file.text())
        const dataStore = new n3.Store(quads)

        return {
          fileHandle,
          dataStore,
        }
      })
    })(),
  },
}).createMachine({
  id: 'vocedit',
  initial: 'empty',
  context: {
    fileHandle: null,
    dataStore: null,
  },
  states: {
    empty: {
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
              dataStore: ({ event }) => event.output.dataStore,
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
              dataStore: null,
            }),
          ],
        },
      },
    },
  },
})
