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
import GitHubCreateNewBranch from '@/components/github/GitHubCreateNewBranch.vue'
import { Separator } from '@/components/ui/separator'

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
      headers: {
        'If-None-Match': '',
      },
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
    send({ type: 'project.open.github.branch.selected', branch: selectedBranch.value })
  }
}

async function handleBranchCreated(branchName: string) {
  await loadBranches()
  selectedBranch.value = branchName
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
      <DialogHeader class="p-6 pb-0 space-y-2">
        <DialogTitle>Open a vocabulary from GitHub</DialogTitle>
        <DialogDescription>
          <strong>Create</strong> or
          <strong> select </strong>
          an existing branch to open the repository
          <strong
            ><code>{{ selectedRepo?.full_name }}</code></strong
          >.
        </DialogDescription>

        <GitHubCreateNewBranch
          :owner="owner!"
          :repo="repo!"
          :branches="branches"
          @branchCreated="handleBranchCreated"
        />

        <Separator class="mt-4" />
      </DialogHeader>

      <div class="px-6">
        <h3 class="text-sm font-medium pb-4">Select an existing branch</h3>

        <div ref="scrollContainer" class="max-h-[400px] overflow-y-auto">
          <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="flex flex-col items-center space-y-3">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <div class="text-sm text-muted-foreground">Loading repository branches...</div>
            </div>
          </div>

          <div v-else-if="branches.length === 0" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="text-sm text-muted-foreground">No branches found</div>
            </div>
          </div>

          <div v-else class="space-y-2">
            <RadioGroup :orientation="'vertical'" v-model="selectedBranch">
              <div v-for="branch in branches" :key="branch.name" class="group relative">
                <div
                  class="flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-muted/50 hover:border-muted-foreground/20"
                  :class="{
                    'bg-primary/5 border-primary/20 ring-1 ring-primary/20':
                      selectedBranch === branch.name,
                    'border-border': selectedBranch !== branch.name,
                    'opacity-50 cursor-not-allowed': branch.protected,
                  }"
                  @click="!branch.protected && (selectedBranch = branch.name)"
                >
                  <RadioGroupItem
                    :id="branch.name"
                    :value="branch.name"
                    :disabled="branch.protected"
                    class="shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <Label
                      :for="branch.name"
                      class="flex items-center space-x-2 cursor-pointer"
                      :class="{ 'text-muted-foreground': branch.protected }"
                    >
                      <span class="font-medium truncate">{{ branch.name }}</span>
                      <span
                        v-if="branch.protected"
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      >
                        Protected
                      </span>
                    </Label>
                  </div>
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
