<script setup lang="ts">
import { computed } from 'vue'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from '@/components/ui/sidebar'
import SidebarList from '@/components/SidebarList.vue'
import { useResourceManagerContext } from '@kurrawongai/shacl-ui'
import { useVocEditMachine } from '@/composables/vocedit-machine'
import { rdf, skos } from '@/namespaces'
import { Separator } from '@/components/ui/separator'

const resourceManager = useResourceManagerContext()
const { snapshot } = useVocEditMachine()

const vocabularies = computed(() => {
  const items = resourceManager.dataGraph.value
    .getSubjects(rdf.type, skos.ConceptScheme, null)
    .map((conceptScheme) => {
      const [label] = resourceManager.dataGraph.value.getObjects(
        conceptScheme,
        skos.prefLabel,
        null,
      )
      return {
        title: label.value || conceptScheme.value.split('#').slice(-1)[0].split('/').slice(-1)[0],
        iri: conceptScheme.value,
      }
    })

  return items
})

const collections = computed(() => {
  const items = resourceManager.dataGraph.value
    .getSubjects(rdf.type, skos.Collection, null)
    .map((collection) => {
      const [label] = resourceManager.dataGraph.value.getObjects(collection, skos.prefLabel, null)
      return {
        title: label.value || collection.value.split('#').slice(-1)[0].split('/').slice(-1)[0],
        iri: collection.value,
      }
    })

  return items
})

const concepts = computed(() => {
  const items = resourceManager.dataGraph.value
    .getSubjects(rdf.type, skos.Concept, null)
    .map((concept) => {
      const [label] = resourceManager.dataGraph.value.getObjects(concept, skos.prefLabel, null)
      return {
        title: label.value || concept.value.split('#').slice(-1)[0].split('/').slice(-1)[0],
        iri: concept.value,
      }
    })

  return items
})
</script>

<template>
  <Sidebar>
    <template v-if="snapshot.matches('empty') || snapshot.matches('opening')">
      <SidebarContent>
        <SidebarGroup class="h-full flex items-center justify-center">
          <span class="text-sm text-muted-foreground italic">No project opened</span>
        </SidebarGroup>
      </SidebarContent>
    </template>

    <template v-else>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarList label="Vocabularies" :items="vocabularies" />
              <Separator />
              <SidebarList label="Collections" :items="collections" />
              <Separator />
              <SidebarList label="Concepts" :items="concepts" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </template>
  </Sidebar>
</template>
