<script setup lang="ts">
import { ChevronRight, type LucideIcon } from 'lucide-vue-next'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuAction,
} from '@/components/ui/sidebar'

type Item = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: Item[]
}

defineProps<{
  items: Item[]
}>()
</script>

<template>
  <SidebarMenuItem v-for="item in items" :key="item.title">
    <Collapsible :default-open="item.isActive">
      <SidebarMenuItem>
        <SidebarMenuButton as-child :tooltip="item.title">
          <a :href="item.url">
            <component :is="item.icon" />
            <span>{{ item.title }}</span>
          </a>
        </SidebarMenuButton>
        <CollapsibleTrigger as-child>
          <SidebarMenuAction class="data-[state=open]:rotate-90">
            <ChevronRight />
            <span class="sr-only">Toggle</span>
          </SidebarMenuAction>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarTree :items="item.items" />
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  </SidebarMenuItem>
</template>
