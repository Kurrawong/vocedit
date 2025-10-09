<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch, computed } from 'vue'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { GitHubRepository, GitHubOrganization } from '@/github'

const { send, snapshot } = useVocEditMachine()
const isOpen = ref(true)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const repos = ref<GitHubRepository[]>([])
const selectedRepo = ref<GitHubRepository | null>(null)
const currentPage = ref(1)
const hasMoreRepos = ref(true)
const scrollContainer = ref<HTMLElement>()
const searchQuery = ref('')
const isSearching = ref(false)
const organizations = ref<GitHubOrganization[]>([])
const selectedUserOrg = ref<string>('')
const isLoadingOrgs = ref(false)

const octokit = useOctokit()
const PER_PAGE = 30
const DESCRIPTION_MAX_LENGTH = 70

const authenticatedUser = computed(() => snapshot.value.context.githubUser)

const loadOrganizations = async () => {
  try {
    isLoadingOrgs.value = true
    const response = await octokit.rest.orgs.listForAuthenticatedUser({
      per_page: 100,
    })
    organizations.value = response.data
  } catch (error) {
    console.error('Error loading organizations:', error)
  } finally {
    isLoadingOrgs.value = false
  }
}

const loadOrganizationRepositories = async (
  orgName: string,
  page: number = 1,
  append: boolean = false,
) => {
  try {
    if (page === 1) {
      isLoading.value = true
    } else {
      isLoadingMore.value = true
    }

    const response = await octokit.rest.repos.listForOrg({
      org: orgName,
      per_page: PER_PAGE,
      page: page,
      sort: 'updated',
      type: 'all',
    })

    if (append) {
      repos.value = [...repos.value, ...response.data]
    } else {
      repos.value = response.data
    }

    // Check if we have more repositories to load
    hasMoreRepos.value = response.data.length === PER_PAGE
    currentPage.value = page
  } catch (error) {
    console.error('Error loading organization repositories:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const loadRepositories = async (page: number = 1, append: boolean = false) => {
  try {
    if (page === 1) {
      isLoading.value = true
    } else {
      isLoadingMore.value = true
    }

    // Check if we're loading repositories for an organization or the authenticated user
    if (selectedUserOrg.value && selectedUserOrg.value !== authenticatedUser.value?.login) {
      // Loading organization repositories
      await loadOrganizationRepositories(selectedUserOrg.value, page, append)
    } else {
      // Loading user repositories
      const response = await octokit.rest.repos.listForAuthenticatedUser({
        per_page: PER_PAGE,
        page: page,
        sort: 'updated',
        affiliation: 'owner',
      })

      if (append) {
        repos.value = [...repos.value, ...response.data]
      } else {
        repos.value = response.data
      }

      // Check if we have more repositories to load
      hasMoreRepos.value = response.data.length === PER_PAGE
      currentPage.value = page
    }
  } catch (error) {
    console.error('Error loading repositories:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const loadMoreRepositories = async () => {
  if (!hasMoreRepos.value || isLoadingMore.value || isSearching.value) return

  await loadRepositories(currentPage.value + 1, true)
}

const handleScroll = async (event: Event) => {
  const target = event.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target

  // Load more when user scrolls to within 100px of the bottom
  if (scrollHeight - scrollTop - clientHeight < 100) {
    await loadMoreRepositories()
  }
}

const selectRepo = (repo: GitHubRepository) => {
  selectedRepo.value = repo
}

onMounted(async () => {
  selectedUserOrg.value = authenticatedUser.value?.login ?? ''
  await loadRepositories(1)
  await loadOrganizations()
  await nextTick()

  // Add scroll listener to the scrollable container
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll)
  }
})

// Clean up scroll listener on unmount
onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll)
  }
})

const handleOpenChange = (open: boolean) => {
  if (!open) {
    send({ type: 'project.open.github.cancel' })
  }
}

const handlePointerDownOutside = (event: Event) => {
  event.preventDefault()
}

const handleEscapeKeyDown = (event: Event) => {
  event.preventDefault()
}

const handleNext = () => {
  if (selectedRepo.value) {
    send({ type: 'project.open.github.repository.selected', repository: selectedRepo.value })
  }
}

const searchRepositories = async (query: string) => {
  if (!query.trim()) {
    // If search query is empty, reload the paginated listing
    isSearching.value = false
    await loadRepositories(1)
    return
  }

  try {
    isLoading.value = true
    isSearching.value = true

    let searchQuery = query
    if (selectedUserOrg.value) {
      searchQuery = `user:${selectedUserOrg.value} ${query}`
    } else {
      searchQuery = `user:@me ${query}`
    }

    const response = await octokit.rest.search.repos({
      q: searchQuery,
      per_page: PER_PAGE,
      sort: 'updated',
    })

    // Replace repos entirely with search results
    repos.value = response.data.items
    hasMoreRepos.value = false // Search results don't support pagination in the same way
    currentPage.value = 1
  } catch (error) {
    console.error('Error searching repositories:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async () => {
  await searchRepositories(searchQuery.value)
}

// Watch for changes in search query to handle clearing
watch(searchQuery, async (newQuery) => {
  if (!newQuery.trim() && isSearching.value) {
    // If search query is cleared and we were searching, reload paginated listing
    isSearching.value = false
    await loadRepositories(1)
  }

  if (!selectedUserOrg.value) {
    selectedUserOrg.value = authenticatedUser.value?.login ?? ''
  }
})

// Watch for changes in selected user/org to trigger reload
watch(selectedUserOrg, async () => {
  if (searchQuery.value.trim() && isSearching.value) {
    // If we're searching, re-run the search with the new user/org
    await searchRepositories(searchQuery.value)
  } else {
    // If we're in listing mode, reload repositories for the selected user/org
    await loadRepositories(1)
  }
})
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
        <DialogDescription> Select a GitHub repository to open. </DialogDescription>

        <div class="flex gap-2 mt-4">
          <Input
            v-model="searchQuery"
            placeholder="Search repositories"
            @keyup.enter="handleSearch"
            @keyup.escape="() => (searchQuery = '')"
            class="flex-1"
          />
          <Button @click="handleSearch" :disabled="isLoading"> Search </Button>
        </div>

        <div class="mt-4">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-muted-foreground">GitHub User/Org:</label>
            <Select v-model="selectedUserOrg" :disabled="isLoadingOrgs">
              <SelectTrigger class="w-[300px]">
                <SelectValue placeholder="Select user or organization" />
              </SelectTrigger>
              <SelectContent>
                <!-- Authenticated user option -->
                <SelectItem
                  v-if="authenticatedUser"
                  :value="authenticatedUser.login"
                  class="flex items-center gap-2"
                >
                  <img
                    :src="authenticatedUser.avatar_url"
                    :alt="authenticatedUser.login"
                    class="w-4 h-4 rounded-full"
                  />
                  {{ authenticatedUser.login }} (You)
                </SelectItem>
                <!-- Organization options -->
                <SelectItem
                  v-for="org in organizations"
                  :key="org.id"
                  :value="org.login"
                  class="flex items-center gap-2"
                >
                  <img :src="org.avatar_url" :alt="org.login" class="w-4 h-4 rounded-full" />
                  {{ org.login }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogHeader>

      <div
        ref="scrollContainer"
        class="grid gap-4 py-4 overflow-y-auto px-6"
        @scroll="handleScroll"
      >
        <div class="flex flex-col justify-between">
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <div class="text-sm text-muted-foreground">
              {{ isSearching ? 'Searching repositories...' : 'Loading repositories...' }}
            </div>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="repo in repos"
              :key="repo.id"
              class="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              :class="{ 'bg-primary/10 border-primary': selectedRepo?.id === repo.id }"
              @click="selectRepo(repo)"
            >
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm truncate">{{ repo.full_name || repo.name }}</div>
                <div class="text-xs text-muted-foreground truncate">
                  <span
                    v-if="
                      repo.description?.length && repo.description?.length > DESCRIPTION_MAX_LENGTH
                    "
                    >{{ repo.description?.slice(0, DESCRIPTION_MAX_LENGTH) }}...</span
                  >
                  <span v-else>{{ repo.description || 'No description' }}</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-muted-foreground">{{
                    repo.language || 'No language'
                  }}</span>
                  <span class="text-xs text-muted-foreground">•</span>
                  <span class="text-xs text-muted-foreground"
                    >{{ repo.stargazers_count || 0 }} stars</span
                  >
                  <span class="text-xs text-muted-foreground">•</span>
                  <span class="text-xs text-muted-foreground"
                    >Updated {{ new Date(repo.updated_at || '').toLocaleDateString() }}</span
                  >
                </div>
              </div>
              <div v-if="selectedRepo?.id === repo.id" class="ml-2">
                <div class="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </div>

            <!-- Loading more indicator -->
            <div v-if="isLoadingMore && !isSearching" class="flex items-center justify-center py-4">
              <div class="text-sm text-muted-foreground">Loading more repositories...</div>
            </div>

            <!-- End of list indicator -->
            <div
              v-if="!hasMoreRepos && repos.length > 0 && !isSearching"
              class="flex items-center justify-center py-4"
            >
              <div class="text-sm text-muted-foreground">No more repositories</div>
            </div>

            <!-- Search results indicator -->
            <div
              v-if="isSearching && repos.length === 0 && !isLoading"
              class="flex items-center justify-center py-4"
            >
              <div class="text-sm text-muted-foreground">
                No repositories found matching your search
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="p-6 pt-0">
        <Button variant="secondary" @click="handleOpenChange(false)">Cancel</Button>
        <Button :disabled="!selectedRepo" @click="handleNext">Next</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
