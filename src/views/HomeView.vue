<script setup lang="ts">
import { useVocEditMachine } from '@/composables/vocedit-machine'

const { snapshot } = useVocEditMachine()
</script>

<template>
  <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <div
      class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min flex items-center justify-center"
    >
      <span
        v-if="!snapshot.can({ type: 'project.close' })"
        class="text-sm text-muted-foreground italic"
        >Use the menu bar to get started</span
      >
      <span v-else class="text-sm text-muted-foreground italic">
        Select a vocabulary, collection, or concept to view it
      </span>
    </div>
  </div>
</template>
