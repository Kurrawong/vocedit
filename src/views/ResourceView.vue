<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVocEditMachine } from '@/composables/vocedit-machine'
import { useRouter } from 'vue-router'
import n3 from 'n3'
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
  () => snapshot.value.matches('opened'),
  (matches) => {
    console.log('matches', matches)
    if (!matches || !iri.value) {
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
      return namedNode('https://linked.data.gov.au/def/vocpub/validator/Shui-ConceptScheme')
    } else if (cls.equals(skos.Collection)) {
      return null
    } else if (cls.equals(skos.Concept)) {
      return namedNode('https://linked.data.gov.au/def/vocpub/validator/Shui-Concept')
    }
  }

  return null
})
</script>

<template>
  <div class="px-6">
    <ResourceShell :focus-node="focusNode" :node-shape="nodeShape" />
  </div>
</template>
