<script setup lang="ts">
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { useVocEditMachine } from '@/composables/vocedit-machine'

const { snapshot, send } = useVocEditMachine()
</script>

<template>
  <Menubar>
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem disabled> New Project (coming soon) </MenubarItem>
        <MenubarItem :disabled="!snapshot.matches('empty')" @click="send({ type: 'project.open' })">
          Open Project
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem
          :disabled="!snapshot.matches('opened')"
          @click="send({ type: 'project.close' })"
        >
          Close Project
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
</template>
