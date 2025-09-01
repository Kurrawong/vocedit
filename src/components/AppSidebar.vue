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

const resourceManager = useResourceManagerContext()
const { snapshot } = useVocEditMachine()

const vocabularies = computed(() => {
  const label = 'Vocabularies'
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
        url: `/resource?iri=${conceptScheme.value}`,
      }
    })

  return {
    label,
    items,
  }
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
              <SidebarList :items="vocabularies.items" :label="vocabularies.label" />
              <SidebarList label="Collections" :items="[]" />
              <SidebarList label="Concepts" :items="[]" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </template>
  </Sidebar>
</template>
