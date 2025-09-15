<script setup lang="ts">
import { RouterView } from 'vue-router'
import { createResourceManager } from '@kurrawongai/shacl-ui'
import { createVocEditMachine } from '@/composables/vocedit-machine'
import AppMenubar from '@/components/AppMenubar.vue'
import Main from '@/components/Main.vue'
import { Toaster } from '@/components/ui/sonner'
// css import required for vue-sonner v2
import 'vue-sonner/style.css'
import vocpub from '@/assets/vocpub.ttl?raw'
import DeleteResourceDialog from '@/components/DeleteResourceDialog.vue'

const resourceManager = createResourceManager()
resourceManager.resetShapesGraph(vocpub)
createVocEditMachine(resourceManager)
</script>

<template>
  <Main>
    <template #header>
      <AppMenubar />
    </template>

    <RouterView />
  </Main>

  <Toaster />

  <DeleteResourceDialog />
</template>
