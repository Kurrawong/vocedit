<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useVocEditMachine } from '@/composables/vocedit-machine'
import { useRouter } from 'vue-router'

const route = useRoute()
const iri = route.query.iri as string
const router = useRouter()

const { snapshot } = useVocEditMachine()

// if we are not in the opened state, we should redirect to the home page
if (!snapshot.value.matches('opened') || !iri) {
  router.push('/')
}
</script>

<template>
  <h1 class="text-3xl font-bold">This is an resource page</h1>
</template>
