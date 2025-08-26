<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { createVocEditMachine } from '@/composables/vocedit-machine'
import AppMenubar from '@/components/AppMenubar.vue'

const { snapshot } = createVocEditMachine()

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

  <AppMenubar />

  <pre>{{ state }}</pre>

  <RouterView />
</template>
