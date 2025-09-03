<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'
import { ChevronRight } from 'lucide-vue-next'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

type Item = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: Item[]
}

defineProps<{
  label?: string
  isSub?: boolean
  items: Item[]
}>()
</script>

<template>
  <template v-if="isSub">
    <Collapsible
      v-for="subItem in items"
      :key="subItem.title"
      as-child
      :default-open="subItem.isActive"
    >
      <SidebarMenuSubItem>
        <SidebarMenuSubButton as-child>
          <a :href="subItem.url">
            <component :is="subItem.icon" />
            <span>{{ subItem.title }}</span>
          </a>
        </SidebarMenuSubButton>
        <template v-if="subItem.items?.length">
          <CollapsibleTrigger as-child>
            <SidebarMenuAction class="data-[state=open]:rotate-90">
              <ChevronRight />
              <span class="sr-only">Toggle</span>
            </SidebarMenuAction>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <template v-if="subItem.items?.length">
              <SidebarMenuSub>
                <NavTree :items="subItem.items" :is-sub="true" />
              </SidebarMenuSub>
            </template>
          </CollapsibleContent>
        </template>
      </SidebarMenuSubItem>
    </Collapsible>
  </template>

  <template v-else>
    <SidebarGroup>
      <SidebarGroupLabel>{{ label }}</SidebarGroupLabel>
      <SidebarMenu>
        <template v-if="items.length">
          <Collapsible
            v-for="item in items"
            :key="item.title"
            as-child
            :default-open="item.isActive"
          >
            <SidebarMenuItem>
              <SidebarMenuButton as-child :tooltip="item.title">
                <a :href="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </a>
              </SidebarMenuButton>
              <template v-if="item.items?.length">
                <CollapsibleTrigger as-child>
                  <SidebarMenuAction class="data-[state=open]:rotate-90">
                    <ChevronRight />
                    <span class="sr-only">Toggle</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <template v-if="item.items?.length">
                    <SidebarMenuSub>
                      <NavTree :items="item.items" :is-sub="true" />
                    </SidebarMenuSub>
                  </template>
                </CollapsibleContent>
              </template>
            </SidebarMenuItem>
          </Collapsible>
        </template>
        <template v-else>
          <span class="ml-2 text-xs italic">No items</span>
        </template>
      </SidebarMenu>
    </SidebarGroup>
  </template>
</template>
