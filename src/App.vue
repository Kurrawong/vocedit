<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { createResourceManager } from '@kurrawongai/shacl-ui'
import { createVocEditMachine } from '@/composables/vocedit-machine'
import AppMenubar from '@/components/AppMenubar.vue'
import Main from '@/components/Main.vue'

const resourceManager = createResourceManager()
const { snapshot } = createVocEditMachine(resourceManager)
const state = computed(() => snapshot.value)
</script>

<template>
  <Main>
    <template #header>
      <AppMenubar />
      <div class="px-5 py-3">
        <pre>{{ state.context.resourceManager.dataGraph.value.size }}</pre>
        <pre>{{ state.value }}</pre>
      </div>
    </template>

    <RouterView />
  </Main>
</template>
