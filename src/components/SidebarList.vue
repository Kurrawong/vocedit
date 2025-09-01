<script setup lang="ts">
import { type LucideIcon } from 'lucide-vue-next'

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'

type Item = {
  title: string
  url: string
  icon: LucideIcon
}

defineProps<{
  label: string
  items: Item[]
}>()
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>{{ label }}</SidebarGroupLabel>
    <SidebarMenu>
      <template v-if="items.length">
        <SidebarMenuItem v-for="item in items" :key="item.title">
          <SidebarMenuButton as-child :tooltip="item.title">
            <a :href="item.url">
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </template>

      <template v-else>
        <span class="ml-2 text-xs italic">No items</span>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
