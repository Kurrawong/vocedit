import { showOpenFilePicker } from 'show-open-file-picker'
import { fromPromise, setup } from 'xstate'
import type { CreateResourceManagerReturn } from '@/types'
import n3, { type NamedNode } from 'n3'
import { rdf, rdfs, skos } from '@/namespaces'
import type { Router } from 'vue-router'
import type { GitHubUser, GitHubRepository } from '@/github'
import { prettify } from '@/lib/prettify'
import { Octokit } from 'octokit'
import { signIn } from '@/github'

const { quad } = n3.DataFactory

export interface GitHubContext {
  user: GitHubUser
  repository: GitHubRepository | null
}

export const machineSetup = setup({
  types: {
    tags: {} as
      | 'createResourceDialog'
      | 'validationReport'
      | 'deleteResourceDialog'
      | 'saving'
      | 'savingError',
    context: {} as {
      resourceManager: CreateResourceManagerReturn
      fileHandle: FileSystemFileHandle | null
      resourceToDelete: NamedNode | null
      router: Router
      savingError: string | null
      github: GitHubContext | null
    },
    events: {} as
      | { type: 'project.new' }
      | { type: 'project.open.file' }
      | { type: 'project.open.file.cancel' }
      | { type: 'project.open.github' }
      | { type: 'project.open.github.repository.select' }
      | { type: 'project.open.github.repository.selected'; repository: GitHubRepository }
      | { type: 'project.open.github.cancel' }
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
      | { type: 'validation.view.report.close' }
      | { type: 'integration.github.auth' }
      | { type: 'integration.github.auth.profile' }
      | { type: 'integration.github.auth.profile.close' }
      | { type: 'integration.github.auth.logout' }
      | { type: 'integration.github.checking' },
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
          const data = await prettify(input.resourceManager.dataGraph.value.toString())
          await writable.write(data)
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
    checkGitHubAuth: fromPromise(async () => {
      const access_token = sessionStorage.getItem('github_access_token')
      if (!access_token) {
        return {
          isAuthenticated: false,
          github: null,
        }
      }
      const expires_at = sessionStorage.getItem('github_access_token_expires_at')
      if (!expires_at) {
        return {
          isAuthenticated: false,
          github: null,
        }
      }
      if (Date.now() > parseInt(expires_at)) {
        // Token has expired, clear it from storage
        sessionStorage.removeItem('github_access_token')
        sessionStorage.removeItem('github_access_token_expires_at')
        return {
          isAuthenticated: false,
          github: null,
        }
      }

      try {
        const octokit = new Octokit({ auth: access_token })
        const user = await octokit.request('GET /user')
        return {
          isAuthenticated: true,
          github: {
            user: {
              ...user.data,
              twitter_username: user.data.twitter_username ?? null,
            },
            repository: null,
          },
        }
      } catch (err) {
        console.error('Error checking GitHub authentication:', err)
        // Clear invalid token from storage
        sessionStorage.removeItem('github_access_token')
        sessionStorage.removeItem('github_access_token_expires_at')
        return {
          isAuthenticated: false,
          github: null,
        }
      }
    }),
    gitHubSignIn: fromPromise(async () => {
      await signIn()
    }),
  },
})
