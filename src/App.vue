<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { createResourceManager } from '@kurrawongai/shacl-ui'
import { createVocEditMachine } from '@/composables/vocedit-machine'
import AppMenubar from '@/components/AppMenubar.vue'
import Index from '@/components/Index.vue'

const resourceManager = createResourceManager()
const { snapshot } = createVocEditMachine(resourceManager)
const state = computed(() => snapshot.value)
</script>

<template>
  <!-- <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header> -->

  <!-- <AppMenubar /> -->

  <Index />

  <pre>{{ state.context.resourceManager.dataGraph.value.size }}</pre>
  <pre>{{ state.value }}</pre>

  <RouterView />
</template>
