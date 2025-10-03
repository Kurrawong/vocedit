<script setup lang="ts">
import { computed } from 'vue'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import SidebarList from '@/components/SidebarList.vue'
import { useResourceManagerContext } from '@kurrawongai/shacl-ui'
import { useVocEditMachine } from '@/composables/vocedit-machine'
import { rdf, skos } from '@/namespaces'
import { Separator } from '@/components/ui/separator'
import { Command } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import VirtualisedSideBarList from '@/components/VirtualisedSideBarList.vue'

const resourceManager = useResourceManagerContext()
const { snapshot } = useVocEditMachine()

const vocabularies = computed(() => {
  const items = resourceManager.dataGraph.value
    .getSubjects(rdf.type, skos.ConceptScheme, null)
    .filter((conceptScheme) => conceptScheme.termType === 'NamedNode')
    .map((conceptScheme) => {
      const [label] = resourceManager.dataGraph.value.getObjects(
        conceptScheme,
        skos.prefLabel,
        null,
      )
      return {
        title: label?.value || conceptScheme.value.split('#').slice(-1)[0].split('/').slice(-1)[0],
        iri: conceptScheme.value,
      }
    })

  return items
})

const collections = computed(() => {
  const items = resourceManager.dataGraph.value
    .getSubjects(rdf.type, skos.Collection, null)
    .filter((collection) => collection.termType === 'NamedNode')
    .map((collection) => {
      const [label] = resourceManager.dataGraph.value.getObjects(collection, skos.prefLabel, null)
      return {
        title: label?.value || collection.value.split('#').slice(-1)[0].split('/').slice(-1)[0],
        iri: collection.value,
      }
    })

  return items
})

const concepts = computed(() => {
  const items = resourceManager.dataGraph.value
    .getSubjects(rdf.type, skos.Concept, null)
    .filter((concept) => concept.termType === 'NamedNode')
    .map((concept) => {
      const [label] = resourceManager.dataGraph.value.getObjects(concept, skos.prefLabel, null)
      return {
        title: label?.value || concept.value.split('#').slice(-1)[0].split('/').slice(-1)[0],
        iri: concept.value,
      }
    })

  return items
})
</script>

<template>
  <Sidebar embedded>
    <template v-if="snapshot.matches({ app: 'empty' }) || snapshot.matches({ app: 'opening' })">
      <SidebarContent>
        <SidebarGroup class="h-full flex items-center justify-center">
          <span class="text-sm text-muted-foreground italic">No project opened</span>
        </SidebarGroup>
      </SidebarContent>
    </template>

    <template v-else>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child>
              <RouterLink to="/">
                <div
                  class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                >
                  <Command class="size-4" />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">VocEdit</span>
                </div>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent class="flex flex-col h-full overflow-hidden">
        <SidebarGroup class="flex-shrink-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarList label="Vocabularies" :items="vocabularies" />
              <Separator />
              <SidebarList label="Collections" :items="collections" />
              <Separator />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup class="flex-1 min-h-0 overflow-hidden">
          <VirtualisedSideBarList label="Concepts" :items="concepts" />
        </SidebarGroup>
      </SidebarContent>
    </template>
  </Sidebar>
</template>
