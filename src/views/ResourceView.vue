<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVocEditMachine } from '@/composables/vocedit-machine'
import { useRouter } from 'vue-router'
import n3 from 'n3'
import { conceptSchemeShape, collectionShape, conceptShape } from '@/shapes'
import { ResourceShell, useResourceManagerContext } from '@kurrawongai/shacl-ui'
import { rdf, skos } from '@/namespaces'

const route = useRoute()
const iri = computed(() => route.query.iri as string)
const router = useRouter()
const { namedNode } = n3.DataFactory

const { snapshot } = useVocEditMachine()
const resourceManager = useResourceManagerContext()

watch(iri, () => {
  resourceManager.cancelEditing()
})

watch(
  () => snapshot.value.matches({ app: 'opened' }),
  (matches) => {
    if ((!matches && !iri.value) || snapshot.value.matches({ app: 'empty' })) {
      // Only route to home if we are not in the opened state and there is no iri or we are in the empty state
      router.push('/')
    }
  },
  { immediate: true },
)

const focusNode = computed(() => namedNode(iri.value))
const nodeShape = computed(() => {
  const classes = resourceManager.dataGraph.value.getObjects(focusNode.value, rdf.type, null)

  for (const cls of classes) {
    if (cls.equals(skos.ConceptScheme)) {
      return conceptSchemeShape
    } else if (cls.equals(skos.Collection)) {
      return collectionShape
    } else if (cls.equals(skos.Concept)) {
      return conceptShape
    }
  }

  return null
})

function handleSave() {
  console.log('save')
}
</script>

<template>
  <div class="h-full px-6 flex flex-col">
    <div class="flex-1 min-h-0">
      <ResourceShell :focus-node="focusNode" :node-shape="nodeShape" @save="handleSave" />
    </div>
  </div>
</template>
