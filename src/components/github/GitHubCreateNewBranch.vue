<script setup lang="ts">
import { ref, watch } from 'vue'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { useOctokit } from '@/composables/octokit'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import type { GitHubBranch } from '@/github'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const props = defineProps<{
  owner: string
  repo: string
  branches: GitHubBranch[]
}>()
const emit = defineEmits(['branchCreated'])

const newBranchName = ref<string>('')
const isLoading = ref<boolean>(false)
const octokit = useOctokit()
const selectedBranch = ref<GitHubBranch | undefined>(undefined)

// Watch for changes in branches and set the first branch as selected when available
watch(
  () => props.branches,
  (newBranches) => {
    if (newBranches.length > 0 && !selectedBranch.value) {
      selectedBranch.value = newBranches[0]
    }
  },
  { immediate: true },
)

async function handleCreateBranch() {
  if (!selectedBranch.value) {
    toast.error('Please select a base branch')
    return
  }

  isLoading.value = true
  try {
    await octokit.rest.git.createRef({
      ref: `refs/heads/${newBranchName.value}`,
      owner: props.owner,
      repo: props.repo,
      sha: selectedBranch.value.commit.sha,
    })
    toast.success('Branch created successfully')
    emit('branchCreated', newBranchName.value)
    newBranchName.value = ''
    // Reset to first branch if available
    if (props.branches.length > 0) {
      selectedBranch.value = props.branches[0]
    }
  } catch (error) {
    console.error('Error creating branch:', error)
    toast.error('Error creating branch: ' + error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader class="text-sm font-medium">Create a new branch</CardHeader>
    <CardContent class="space-y-3">
      <div class="flex items-center gap-2">
        <Input
          v-model="newBranchName"
          placeholder="New branch name"
          @keyup.enter="handleCreateBranch"
          @keydown.escape="newBranchName = ''"
          class="flex-grow"
        />
        <span>from</span>
        <Select v-model="selectedBranch">
          <SelectTrigger>
            <SelectValue :placeholder="selectedBranch ? selectedBranch.name : 'Select a branch'" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="branch in branches" :key="branch.name" :value="branch">{{
              branch.name
            }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex justify-end">
        <Button v-if="!isLoading && newBranchName" @click="handleCreateBranch"
          >Create Branch</Button
        >
        <Button v-else-if="isLoading" disabled>Creating branch...</Button>
        <Button v-else disabled>Create a branch</Button>
      </div>
    </CardContent>
  </Card>
</template>
