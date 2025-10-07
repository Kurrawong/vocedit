<script setup lang="ts">
import { useVocEditMachine } from '@/composables/vocedit-machine'
import EmptyProjectDocs from '@/components/docs/EmptyProjectDocs.vue'
import OpenedProjectDocs from '@/components/docs/OpenedProjectDocs.vue'

const { snapshot } = useVocEditMachine()
</script>

<template>
  <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
    <EmptyProjectDocs v-if="!snapshot.can({ type: 'project.close' })" />
    <OpenedProjectDocs v-else />
  </div>
</template>
