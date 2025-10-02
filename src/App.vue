<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { createResourceManager } from '@kurrawongai/shacl-ui'
import { createVocEditMachine } from '@/composables/vocedit-machine'
import AppMenubar from '@/components/AppMenubar.vue'
import Main from '@/components/Main.vue'
import { Toaster } from '@/components/ui/sonner'
// css import required for vue-sonner v2
import 'vue-sonner/style.css'
import vocpub from '@/assets/vocpub.ttl?raw'
import DeleteResourceDialog from '@/components/DeleteResourceDialog.vue'
import CreateResourceDialog from '@/components/CreateResourceDialog.vue'
import ValidationReport from '@/components/ValidationReport.vue'
import SavingDialog from '@/components/SavingDialog.vue'
import GitHubProfile from '@/components/GitHubProfile.vue'

const router = useRouter()
const resourceManager = createResourceManager()
resourceManager.resetShapesGraph(vocpub)
createVocEditMachine(resourceManager, router)
</script>

<template>
  <Main>
    <template #header>
      <AppMenubar />
    </template>

    <RouterView />
  </Main>

  <Toaster position="top-right" />

  <DeleteResourceDialog />
  <CreateResourceDialog />
  <ValidationReport />
  <SavingDialog />
  <GitHubProfile />
</template>
