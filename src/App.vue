<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { createResourceManager } from '@kurrawongai/shacl-ui'
import { createVocEditMachine } from '@/composables/vocedit-machine'
import AppMenubar from '@/components/AppMenubar.vue'
import Main from '@/components/Main.vue'
import { Toaster } from '@/components/ui/sonner'
// css import required for vue-sonner v2
import 'vue-sonner/style.css'
import vocpub from '@/assets/vocpub.ttl?raw'
import DeleteResourceDialog from '@/components/DeleteResourceDialog.vue'
import CreateResourceDialog from '@/components/CreateResourceDialog.vue'
import ValidationReport from '@/components/ValidationReport.vue'
import SavingDialog from '@/components/SavingDialog.vue'
import GitHubProfile from '@/components/GitHubProfile.vue'
import { ExternalLink } from 'lucide-vue-next'

const router = useRouter()
const resourceManager = createResourceManager()
resourceManager.resetShapesGraph(vocpub)
createVocEditMachine(resourceManager, router)

const navigationLinks = [
  {
    label: 'KurrawongAI',
    href: 'https://kurrawong.ai',
  },
  {
    label: 'Vocabulary Docs',
    href: 'https://docs.kurrawong.ai/concepts/vocabs/introduction/',
  },
  {
    label: 'VocPub Profile',
    href: 'https://linked.data.gov.au/def/vocpub',
  },
  {
    label: 'KurrawongAI Tools',
    href: 'https://tools.kurrawong.ai',
  },
]
</script>

<template>
  <Main>
    <template #header>
      <div class="flex items-center justify-between gap-4 px-4 py-3 border-b bg-background">
        <img src="/KurrawongAI_350.png" alt="KurrawongAI Logo" class="h-10 w-auto" />

        <nav class="flex items-center gap-2 overflow-x-auto">
          <a
            v-for="link in navigationLinks"
            :key="link.href"
            :href="link.href"
            target="_blank"
            rel="noopener,noreferrer"
            class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:px-2 sm:py-1.5 sm:text-xs"
          >
            {{ link.label }}
            <ExternalLink class="w-3 h-3" />
          </a>
        </nav>
      </div>

      <AppMenubar />
    </template>

    <RouterView />
  </Main>

  <Toaster position="top-right" />

  <DeleteResourceDialog />
  <CreateResourceDialog />
  <ValidationReport />
  <SavingDialog />
  <GitHubProfile />
</template>
