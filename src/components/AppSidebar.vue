<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from '@/components/ui/sidebar'
import SidebarList from '@/components/SidebarList.vue'
import { createResourceManager } from '@kurrawongai/shacl-ui'
import { createVocEditMachine, useVocEditMachine } from '@/composables/vocedit-machine'

const resourceManager = createResourceManager()
createVocEditMachine(resourceManager)
const { snapshot } = useVocEditMachine()
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
              <SidebarList label="Vocabularies" :items="[]" />
              <SidebarList label="Collections" :items="[]" />
              <SidebarList label="Concepts" :items="[]" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </template>
  </Sidebar>
</template>
