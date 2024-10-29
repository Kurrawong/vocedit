<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Message from 'primevue/message'

const isSupported = ref(false)

onMounted(() => {
  if (window.showOpenFilePicker) {
    isSupported.value = true
    console.log(window.showOpenFilePicker)
  }
})
</script>

<template>
  <div class="p-4 space-y-2">
    <template v-if="isSupported">
      <h2 class="text-xl">Getting Started</h2>
      <p>
        Use the project menu to create a new vocabulary or open an existing file
        on your filesystem.
      </p>
    </template>
    <template v-else>
      <Message severity="error" :closable="false"
        >VocPub is not supported in your browser.</Message
      >
      <p>Please try the application in Chrome.</p>
      <p>
        VocPub requires the
        <a
          class="text-blue-500 hover:underline"
          href="https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker"
          >Window: showOpenFilePicker() method</a
        >, which is not supported in your browser.
      </p>
      <p>
        A future version of VocEdit will support all modern browsers using a
        polyfill.
      </p>
    </template>
  </div>
</template>
