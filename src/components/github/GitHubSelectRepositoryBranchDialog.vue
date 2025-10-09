<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useVocEditMachine } from '@/composables/vocedit-machine'
import { Button } from '@/components/ui/button'
import { useOctokit } from '@/composables/octokit'
import type { GitHubRepositoryFile } from '@/github'

const { send, snapshot } = useVocEditMachine()
const isOpen = ref(true)
const isLoading = ref(false)
const selectedRepo = computed(() => snapshot.value.context.github?.repository)
const selectedFile = ref<GitHubRepositoryFile | null>(null)
const octokit = useOctokit()
const PER_PAGE = 30

const handlePointerDownOutside = (event: Event) => {
  event.preventDefault()
}

const handleEscapeKeyDown = (event: Event) => {
  event.preventDefault()
}

const handleOpenChange = (open: boolean) => {
  if (!open) {
    send({ type: 'project.open.github.cancel' })
  }
}

const handleNext = () => {
  if (selectedFile.value) {
    console.log(selectedFile.value)
  }
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange" class="w-[1000px]">
    <DialogContent
      :disable-outside-pointer-events="true"
      @pointer-down-outside="handlePointerDownOutside"
      @escape-key-down="handleEscapeKeyDown"
      class="grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]"
    >
      <DialogHeader class="p-6 pb-0">
        <DialogTitle>Opening a vocabulary from GitHub</DialogTitle>
        <DialogDescription> Select a GitHub repository file to open. </DialogDescription>
      </DialogHeader>

      <div ref="scrollContainer" class="grid gap-4 py-4 overflow-y-auto px-6">
        <div class="flex flex-col justify-between">
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <div class="text-sm text-muted-foreground">Loading repository files...</div>
          </div>

          <div v-else class="space-y-2"></div>
        </div>
      </div>

      <DialogFooter class="p-6 pt-0">
        <Button variant="secondary" @click="handleOpenChange(false)">Cancel</Button>
        <Button :disabled="!selectedFile" @click="handleNext">Next</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
