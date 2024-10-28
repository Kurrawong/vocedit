<script setup lang="ts">
import SideNav from '@/components/SideNav.vue'
import Page from '@/components/Page.vue'
</script>

<template>
  <Page>
    <template #side-nav>
      <SideNav />
    </template>

    <div>Select a resource on the left to get started.</div>
  </Page>
</template>
