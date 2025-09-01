<script setup lang="ts">
import { RouterView } from 'vue-router'
import { createResourceManager } from '@kurrawongai/shacl-ui'
import { createVocEditMachine } from '@/composables/vocedit-machine'
import AppMenubar from '@/components/AppMenubar.vue'
import Main from '@/components/Main.vue'
import vocpub from '@/assets/vocpub.ttl?raw'

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
</template>
