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
  SidebarMenuAction,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2 } from 'lucide-vue-next'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useVocEditMachine } from '@/composables/vocedit-machine'
import n3 from 'n3'
import { useVirtualList } from '@vueuse/core'

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
const { namedNode } = n3.DataFactory
const count = computed(() => props.items.length)
const { send } = useVocEditMachine()

function handleDelete(iri: string) {
  send({ type: 'resource.delete', resourceIri: namedNode(iri) })
}

const { list, containerProps, wrapperProps } = useVirtualList(props.items, {
  itemHeight: 32,
})
</script>

<template>
  <SidebarGroup class="flex flex-col h-full overflow-hidden">
    <SidebarGroupLabel class="flex-shrink-0"
      >{{ label }}
      <span class="text-[10px] pl-1" v-if="count > 0">({{ count }})</span></SidebarGroupLabel
    >
    <SidebarMenu class="flex-1 min-h-0 overflow-hidden">
      <template v-if="count">
        <div v-bind="containerProps" class="h-full overflow-auto">
          <div v-bind="wrapperProps">
            <SidebarMenuItem v-for="item in list" :key="item.data.title">
              <SidebarMenuButton
                as-child
                :tooltip="item.data.title"
                :is-active="item.data.iri === iri"
              >
                <RouterLink :to="`/resource?iri=${item.data.iri}`">
                  <span class="truncate" :title="item.data.title">{{ item.data.title }}</span>
                </RouterLink>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <SidebarMenuAction show-on-hover>
                    <MoreHorizontal />
                    <span class="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56 rounded-lg" :side="'right'" :align="'start'">
                  <DropdownMenuItem variant="destructive" @click="handleDelete(item.data.iri)">
                    <Trash2 class="text-muted-foreground" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </div>
        </div>
      </template>

      <template v-else>
        <span class="ml-2 text-xs italic">No items</span>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
