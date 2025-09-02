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

const props = defineProps<{
  label: string
  items: Item[]
}>()

const route = useRoute()
const iri = computed(() => route.query.iri as string)
const count = computed(() => props.items.length)
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel
      >{{ label }}
      <span class="text-[10px] pl-1" v-if="count > 0">({{ count }})</span></SidebarGroupLabel
    >
    <SidebarMenu>
      <template v-if="count">
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
