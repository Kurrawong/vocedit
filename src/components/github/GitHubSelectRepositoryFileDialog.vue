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
import type { GitHubRepositoryFile } from '@/github'
import { File, Folder, FolderUp } from 'lucide-vue-next'

const { send, snapshot } = useVocEditMachine()
const isOpen = ref(true)
const isLoading = ref(false)
const selectedRepo = computed(() => snapshot.value.context.github?.repository)
const selectedRepoOwner = computed(() => selectedRepo.value?.owner?.login ?? '')
const selectedRepoName = computed(() => selectedRepo.value?.name ?? '')
const selectedBranch = computed(() => snapshot.value.context.github?.branch ?? '')
const previousPath = ref<GitHubRepositoryFile[]>([])
const selectedPath = ref('')
const selectedFile = ref<GitHubRepositoryFile | null>(null)
const files = ref<GitHubRepositoryFile[]>([])
const octokit = useOctokit()

onMounted(async () => {
  await loadFiles()
})

async function loadFiles() {
  isLoading.value = true
  try {
    const response = await octokit.rest.repos.getContent({
      owner: selectedRepoOwner.value,
      repo: selectedRepoName.value,
      path: selectedPath.value,
      ref: selectedBranch.value,
    })
    files.value = response.data as GitHubRepositoryFile[]
  } catch (error) {
    console.error('Error loading files:', error)
  } finally {
    isLoading.value = false
  }
}

async function handleFileDirClick(file: GitHubRepositoryFile) {
  if (file.type === 'file') {
    selectedFile.value = file
  } else {
    selectedFile.value = null
    previousPath.value.push(file)
    selectedPath.value = file.path
    await loadFiles()
  }
}

function handleBack() {
  previousPath.value.pop()
  selectedPath.value = previousPath.value.at(-1)?.path ?? ''
  selectedFile.value = null
  loadFiles()
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
        <DialogTitle>Open a vocabulary from GitHub</DialogTitle>
        <DialogDescription>
          Select a file to open from the repository
          <strong>{{ selectedRepo?.full_name }}</strong> and branch
          <strong>{{ selectedBranch }}</strong
          >.
        </DialogDescription>

        <div>
          <span class="font-semibold">Path: {{ selectedRepoName }}/{{ selectedPath }}</span>
        </div>
      </DialogHeader>

      <div ref="scrollContainer" class="grid gap-4 pb-4 overflow-y-auto px-6">
        <div class="flex flex-col justify-between">
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <div class="text-sm text-muted-foreground">Loading repository content...</div>
          </div>

          <div v-else class="space-y-1">
            <div
              v-if="previousPath.length > 0"
              class="flex items-center space-x-2 cursor-pointer hover:text-blue-500 transition-colors border rounded-md p-2"
              @click="() => handleBack()"
            >
              <FolderUp class="h-4 w-4 text-blue-500" />
              <span>. .</span>
            </div>

            <div v-for="file in files" :key="file.path">
              <div
                @click="() => handleFileDirClick(file)"
                class="flex items-center space-x-2 cursor-pointer hover:text-blue-500 transition-colors border rounded-md p-2"
                :class="{
                  'text-blue-500 font-semibold border-blue-500': selectedFile?.path === file.path,
                }"
              >
                <File v-if="file.type === 'file'" class="h-4 w-4" />
                <Folder v-if="file.type === 'dir'" class="h-4 w-4 text-blue-400 fill-current" />
                <span>{{ file.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="p-6 pt-0">
        <Button variant="secondary" @click="handleOpenChange(false)">Cancel</Button>
        <Button :disabled="!selectedFile" @click="handleNext">Next</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
