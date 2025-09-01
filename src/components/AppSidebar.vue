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
import { createVocEditMachine } from '@/composables/vocedit-machine'

const resourceManager = createResourceManager()
const { snapshot } = createVocEditMachine(resourceManager)
</script>

<template>
  <Sidebar>
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
  </Sidebar>
</template>
