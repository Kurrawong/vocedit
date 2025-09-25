<script setup lang="ts">
import { ref } from 'vue'
import { ExternalLink } from 'lucide-vue-next'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar'
import AboutDialog from '@/components/AboutDialog.vue'
import { useVocEditMachine } from '@/composables/vocedit-machine'

const { snapshot, send } = useVocEditMachine()

const aboutDialogRef = ref<InstanceType<typeof AboutDialog>>()

const openAboutDialog = () => {
  aboutDialogRef.value?.open()
}

const openIssueTracker = () => {
  window.open('https://github.com/Kurrawong/vocedit/issues', '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <Menubar>
    <MenubarMenu>
      <MenubarTrigger>VocEdit</MenubarTrigger>
      <MenubarContent>
        <MenubarItem @click="openAboutDialog">About</MenubarItem>
        <MenubarItem @click="openIssueTracker">
          Issue tracker
          <ExternalLink class="h-4 w-4" />
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>

    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem disabled> New (coming soon) </MenubarItem>
        <MenubarItem :disabled="snapshot.matches('opened')" @click="send({ type: 'project.open' })">
          Open
        </MenubarItem>
        <MenubarItem
          :disabled="!snapshot.matches('opened')"
          @click="send({ type: 'project.save' })"
        >
          Save
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem
          :disabled="!snapshot.matches('opened')"
          @click="send({ type: 'project.close' })"
        >
          Close
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>

    <MenubarMenu v-if="snapshot.matches('opened')">
      <MenubarTrigger>Resource</MenubarTrigger>
      <MenubarContent>
        <MenubarItem @click="send({ type: 'resource.create' })">Create new</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>

  <AboutDialog ref="aboutDialogRef" />
</template>
