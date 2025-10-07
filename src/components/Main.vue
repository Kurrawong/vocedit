<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
</script>

<template>
  <div class="flex h-svh items-center justify-center relative">
    <SidebarProvider default-open>
      <AppSidebar />
      <SidebarInset class="h-screen flex flex-col overflow-hidden">
        <slot name="header" />

        <header class="flex h-16 shrink-0 items-center gap-2">
          <div class="flex items-center gap-2 px-4">
            <SidebarTrigger class="-ml-1" />

            <Separator orientation="vertical" class="mr-2 h-4" />
          </div>
        </header>

        <div class="flex-1 overflow-y-auto min-h-0">
          <slot />
        </div>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>
