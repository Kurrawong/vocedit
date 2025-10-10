<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
import type { GitHubBranch } from '@/github'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const { send, snapshot } = useVocEditMachine()
const isOpen = ref(true)
const isLoading = ref(false)
const selectedRepo = computed(() => snapshot.value.context.github?.repository)
const owner = computed(() => selectedRepo.value?.owner?.login)
const repo = computed(() => selectedRepo.value?.name)
const octokit = useOctokit()
const branches = ref<GitHubBranch[]>([])
const selectedBranch = ref<string>('')

onMounted(async () => {
  await loadBranches()
})

async function loadBranches() {
  isLoading.value = true
  try {
    const response = await octokit.rest.repos.listBranches({
      owner: owner.value!,
      repo: repo.value!,
    })
    branches.value = response.data
  } catch (error) {
    console.error('Error loading branches:', error)
  } finally {
    isLoading.value = false
  }
}

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
  if (selectedBranch.value) {
    console.log(selectedBranch.value)
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
        <DialogTitle>Open a vocabulary from GitHub</DialogTitle>
        <DialogDescription>
          Create or select a branch to browse the repository
          <strong
            ><code>{{ selectedRepo?.full_name }}</code></strong
          >.
        </DialogDescription>
      </DialogHeader>

      <div ref="scrollContainer" class="grid gap-4 pb-4 overflow-y-auto px-6">
        <div class="flex flex-col justify-between">
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <div class="text-sm text-muted-foreground">Loading repository branches...</div>
          </div>

          <div v-else class="space-y-2">
            <RadioGroup
              default-value="comfortable"
              :orientation="'vertical'"
              v-model="selectedBranch"
            >
              <div v-for="branch in branches" :key="branch.name">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem
                    :id="branch.name"
                    :value="branch.name"
                    :disabled="branch.protected"
                  />
                  <Label :for="branch.name" :class="{ 'text-muted-foreground': branch.protected }"
                    >{{ branch.name }} <span v-if="branch.protected"> (protected)</span></Label
                  >
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <DialogFooter class="p-6 pt-0">
        <Button variant="secondary" @click="handleOpenChange(false)">Cancel</Button>
        <Button :disabled="!selectedBranch" @click="handleNext">Next</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
