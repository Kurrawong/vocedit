<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { rdf, skos } from 'shacl-ui/core/namespaces'
import { useShui } from 'shacl-ui/composables/shui'
import Menu from 'primevue/menu'
import { getConceptLabel } from '@/queries'

const router = useRouter()
const { shui } = useShui()
const items = computed(() => {
  let _items: Array<{
    label: string
    items: Array<{ label: string; command: () => void }>
  }> = []
  const store = shui.value.store
  const conceptSchemes = (() => {
    const _conceptSchemes = store.getSubjects(
      rdf.type,
      skos.ConceptScheme,
      null,
    )
    return _conceptSchemes.map(c => ({
      label: getConceptLabel(c, store),
      command: () => {
        router.push({ name: 'resource', query: { iri: c.value } })
      },
    }))
  })()

  const concepts = (() => {
    const concepts = store.getSubjects(rdf.type, skos.Concept, null)
    return concepts
      .map(c => ({
        label: getConceptLabel(c, store),
        command: () => {
          router.push({ name: 'resource', query: { iri: c.value } })
        },
      }))
      .sort((a, b) => {
        if (a.label < b.label) return -1
        if (a.label > b.label) return 1
        return 0
      })
  })()

  if (conceptSchemes) {
    _items = _items.concat([
      {
        label: `Concept Scheme`,
        items: conceptSchemes,
      },
    ])
  }

  if (concepts) {
    _items = _items.concat([
      {
        label: `Concepts (${concepts.length})`,
        items: concepts,
      },
    ])
  }

  return _items
})
</script>

<template>
  <Menu
    :model="items"
    :pt="{
      root: {
        class: 'h-[calc(100vh-7.4rem)] border rounded',
      },
    }"
  />
</template>
