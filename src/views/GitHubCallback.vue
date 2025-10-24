<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { exchangeCodeForToken, checkGitHubAppInstallation } from '@/github'
import { toast } from 'vue-sonner'
import { useVocEditMachine } from '@/composables/vocedit-machine'

const route = useRoute()
const router = useRouter()
const { send } = useVocEditMachine()

onMounted(async () => {
  try {
    const code = route.query.code as string
    const error = route.query.error as string

    if (error) {
      console.error('GitHub authentication error:', error)
      toast.error('GitHub authentication failed')
      router.push('/')
      return
    }

    if (code) {
      await exchangeCodeForToken(code)
      toast.success('Successfully signed in to GitHub!')
      await checkGitHubAppInstallation()
      router.push('/')
    } else {
      toast.error('No authorization code received')
      router.push('/')
    }
  } catch (error) {
    console.error('GitHub authentication error:', error)
    toast.error(error instanceof Error ? error.message : 'Authentication failed')
    router.push('/')
  }
  send({ type: 'integration.github.checking' })
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
      ></div>
      <h2 class="text-lg font-medium text-gray-900 mb-2">Completing GitHub Authentication</h2>
      <p class="text-gray-600">Please wait while we complete your authentication...</p>
    </div>
  </div>
</template>
