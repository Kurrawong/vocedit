<script setup lang="ts">
import { ref, computed } from 'vue'
import { ExternalLink } from 'lucide-vue-next'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from '@/components/ui/menubar'
import AboutDialog from '@/components/AboutDialog.vue'
import { useVocEditMachine } from '@/composables/vocedit-machine'
import { FileCode } from 'lucide-vue-next'
import { GitHubIcon } from 'vue3-simple-icons'

const { snapshot, send } = useVocEditMachine()

const aboutDialogRef = ref<InstanceType<typeof AboutDialog>>()

// Computed properties for GitHub authentication state
const isGitHubAuthenticated = computed(() => snapshot.value.matches({ github: 'authenticated' }))

const isGitHubChecking = computed(() => snapshot.value.matches({ github: 'checking' }))

const isGitHubAuthenticating = computed(() => snapshot.value.matches({ github: 'authenticating' }))

const openAboutDialog = () => {
  aboutDialogRef.value?.open()
}

const openIssueTracker = () => {
  window.open('https://github.com/Kurrawong/vocedit/issues', '_blank', 'noopener,noreferrer')
}

const handleGitHubSignIn = () => {
  send({ type: 'integration.github.auth' })
}

const handleGitHubSignOut = () => {
  send({ type: 'integration.github.auth.logout' })
}
</script>

<template>
  {{ snapshot.value }}
  {{ snapshot.context.fileHandle }}
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
      <MenubarTrigger>Project</MenubarTrigger>
      <MenubarContent>
        <MenubarItem disabled> New (coming soon) </MenubarItem>
        <MenubarSub>
          <MenubarSubTrigger>Open</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem
              :disabled="snapshot.matches({ app: 'opened' })"
              @click="send({ type: 'project.open.file' })"
              ><FileCode />Local file</MenubarItem
            >
            <MenubarItem
              :disabled="snapshot.matches({ app: 'opened' }) || !isGitHubAuthenticated"
              @click="send({ type: 'project.open.github' })"
              ><GitHubIcon />GitHub file</MenubarItem
            >
          </MenubarSubContent>
        </MenubarSub>
        <MenubarItem
          :disabled="!snapshot.matches({ app: 'opened' })"
          @click="send({ type: 'project.save' })"
        >
          Save
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem
          :disabled="!snapshot.matches({ app: 'opened' })"
          @click="send({ type: 'project.close' })"
        >
          Close
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>

    <MenubarMenu v-if="snapshot.matches({ app: 'opened' })">
      <MenubarTrigger>Resource</MenubarTrigger>
      <MenubarContent>
        <MenubarItem @click="send({ type: 'resource.create' })">Create new</MenubarItem>
      </MenubarContent>
    </MenubarMenu>

    <MenubarMenu v-if="snapshot.matches({ app: 'opened' })">
      <MenubarTrigger>Validation</MenubarTrigger>
      <MenubarContent>
        <MenubarItem @click="send({ type: 'validation.view.report' })">View report</MenubarItem>
      </MenubarContent>
    </MenubarMenu>

    <MenubarMenu>
      <MenubarTrigger>Integrations</MenubarTrigger>
      <MenubarContent>
        <MenubarSub>
          <MenubarSubTrigger>GitHub</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem
              v-if="!isGitHubAuthenticated && !isGitHubChecking && !isGitHubAuthenticating"
              @click="handleGitHubSignIn"
            >
              Sign in
            </MenubarItem>
            <MenubarItem v-if="isGitHubChecking" disabled> Checking authentication... </MenubarItem>
            <MenubarItem v-if="isGitHubAuthenticating" disabled> Authenticating... </MenubarItem>
            <MenubarItem
              v-if="isGitHubAuthenticated"
              @click="send({ type: 'integration.github.auth.profile' })"
            >
              User profile
            </MenubarItem>
            <MenubarItem v-if="isGitHubAuthenticated" @click="handleGitHubSignOut">
              Logout
            </MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
      </MenubarContent>
    </MenubarMenu>

    <MenubarMenu v-if="isGitHubAuthenticated">
      <MenubarTrigger>GitHub Profile</MenubarTrigger>
      <MenubarContent>
        <MenubarItem @click="send({ type: 'integration.github.auth.profile' })">
          User profile
        </MenubarItem>
        <MenubarItem @click="handleGitHubSignOut">
          Logout
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>

  <AboutDialog ref="aboutDialogRef" />
</template>
