<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVocEditMachine } from '@/composables/vocedit-machine'
import { useRouter } from 'vue-router'
import n3 from 'n3'
import { ResourceShell, useResourceManagerContext } from '@kurrawongai/shacl-ui'

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
  // TODO: Get the class type of the resource
  // if class type is a concept scheme
  return namedNode('https://linked.data.gov.au/def/vocpub/validator/Shui-ConceptScheme')
})
</script>

<template>
  <div class="px-6">
    <ResourceShell :focus-node="focusNode" :node-shape="nodeShape" />
  </div>
</template>
