<script setup lang="ts">
import { ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const appVersion = __APP_VERSION__
const buildCommit = import.meta.env.VITE_BUILD_COMMIT || 'dev'

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
  emit('close')
}

// Expose methods for parent components to call
defineExpose({
  open,
  close,
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>VocEdit</DialogTitle>
        <DialogDescription>
          An intuitive web tool for building and managing SKOS-compliant controlled vocabularies.
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <p class="text-sm text-muted-foreground">
          VocEdit is a user-friendly tool for creating and managing controlled vocabularies using
          the VocPub Profile of SKOS. Design and organise both flat and hierarchical concept
          structures with an intuitive web interface that makes vocabulary management accessible to
          everyone.
        </p>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="font-medium">Version:</div>
          <div class="overflow-auto">{{ appVersion }}</div>

          <div class="font-medium">Build commit:</div>
          <div class="overflow-auto">{{ buildCommit }}</div>

          <div class="font-medium">Source code:</div>
          <div class="overflow-auto">
            <a
              class="text-primary hover:underline"
              href="https://github.com/Kurrawong/vocedit"
              target="_blank"
              rel="noopener,noreferrer"
            >
              https://github.com/Kurrawong/vocedit
            </a>
          </div>
        </div>
      </div>

      <DialogFooter>
        <button
          class="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
          @click="close"
        >
          Close
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
