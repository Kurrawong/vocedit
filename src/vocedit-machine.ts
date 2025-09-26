import { showOpenFilePicker } from 'show-open-file-picker'
import { assign, fromPromise, setup } from 'xstate'
import { toast } from 'vue-sonner'
import n3, { type NamedNode } from 'n3'
import { rdf, rdfs, skos } from '@/namespaces'
import type { CreateResourceManagerReturn } from '@/types'
import type { Router } from 'vue-router'

const { quad } = n3.DataFactory

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
        | { type: 'resource.delete.cancel' }
        | { type: 'resource.create' }
        | { type: 'resource.create.confirm'; data: { type: NamedNode; iri: NamedNode } }
        | { type: 'resource.create.cancel' }
        | { type: 'validation.view.report' }
        | { type: 'validation.view.report.close' },
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
      createResource: (() => {
        return fromPromise(
          async ({
            input,
          }: {
            input: {
              resourceManager: CreateResourceManagerReturn
              data: { type: NamedNode; iri: NamedNode }
            }
          }) => {
            if (!input.data || !input.data.type || !input.data.iri) {
              throw new Error('Missing required fields: type and iri are required')
            }

            if (input.resourceManager.isEditing.value) {
              input.resourceManager.cancelEditing()
            }

            // Create the resource
            if (input.data.type.equals(skos.ConceptScheme)) {
              // Create a concept scheme
              const quads = [quad(input.data.iri, rdf.type, input.data.type)]
              input.resourceManager.dataGraph.value.addQuads(quads)
            } else {
              // Create a collection or concept
              const conceptSchemes = input.resourceManager.dataGraph.value.getSubjects(
                rdf.type,
                skos.ConceptScheme,
                null,
              )
              if (conceptSchemes.length === 0) {
                throw new Error('No concept scheme found')
              }
              if (conceptSchemes.length > 1) {
                throw new Error('Multiple concept schemes found')
              }
              const conceptScheme = conceptSchemes[0]

              const quads = [
                quad(input.data.iri, rdf.type, input.data.type),
                quad(input.data.iri, skos.inScheme, conceptScheme),
                quad(input.data.iri, rdfs.isDefinedBy, conceptScheme),
              ]
              input.resourceManager.dataGraph.value.addQuads(quads)
            }

            input.resourceManager.startEditing()
            input.resourceManager.save()

            return {
              createdResource: {
                type: input.data.type,
                iri: input.data.iri,
              },
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
        initial: 'idle',
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
        },
        states: {
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
            on: {
              'validation.view.report.close': {
                target: 'idle',
              },
            },
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
