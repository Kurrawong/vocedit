<script setup lang="ts">
import { type LucideIcon } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'

type Item = {
  title: string
  iri: string
  icon?: LucideIcon
}

defineProps<{
  label: string
  items: Item[]
}>()

const route = useRoute()
const iri = computed(() => route.query.iri as string)
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>{{ label }}</SidebarGroupLabel>
    <SidebarMenu>
      <template v-if="items.length">
        <SidebarMenuItem v-for="item in items" :key="item.title">
          <SidebarMenuButton as-child :tooltip="item.title" :is-active="item.iri === iri">
            <RouterLink :to="`/resource?iri=${item.iri}`">
              <span class="truncate" :title="item.title">{{ item.title }}</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </template>

      <template v-else>
        <span class="ml-2 text-xs italic">No items</span>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
