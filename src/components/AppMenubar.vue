<script setup lang="ts">
import { ref } from 'vue'
import { ExternalLink } from 'lucide-vue-next'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarSub,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  MenubarSubTrigger,
  MenubarSubContent,
} from '@/components/ui/menubar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
        <MenubarItem :disabled="!snapshot.matches('empty')" @click="send({ type: 'project.open' })">
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

    <!-- TODO: this should be when the project is opened -->
    <MenubarMenu v-if="!snapshot.matches('empty')">
      <MenubarTrigger>Resources</MenubarTrigger>
      <MenubarContent>
        <MenubarSub>
          <MenubarSubTrigger>Vocabularies</MenubarSubTrigger>
          <MenubarSubContent>
            <Tooltip>
              <TooltipTrigger>
                <!-- TODO: add condition for disabled -->
                <MenubarItem disabled>Create new</MenubarItem>
              </TooltipTrigger>
              <TooltipContent>A vocabulary already exists</TooltipContent>
            </Tooltip>
          </MenubarSubContent>
        </MenubarSub>

        <MenubarSub>
          <MenubarSubTrigger>Collections</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem @click="console.log('create new collection')">Create new</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>

        <MenubarSub>
          <MenubarSubTrigger>Concepts</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem @click="console.log('create new concept')">Create new</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>

  <AboutDialog ref="aboutDialogRef" />
</template>
