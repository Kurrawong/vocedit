<script setup lang="ts">
import { computed } from 'vue'
import { useVocEditMachine } from '@/composables/vocedit-machine'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

const { snapshot, send } = useVocEditMachine()
const isOpen = computed(() => snapshot.value.hasTag('saving'))
const isSavingError = computed(() => snapshot.value.hasTag('savingError'))
</script>

<template>
  <AlertDialog :open="isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle> Saving your project </AlertDialogTitle>
        <AlertDialogDescription> Please wait... </AlertDialogDescription>
      </AlertDialogHeader>
    </AlertDialogContent>
  </AlertDialog>

  <AlertDialog :open="isSavingError">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle> Error saving project </AlertDialogTitle>
        <AlertDialogDescription> {{ snapshot.context.savingError }} </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button variant="outline" @click="send({ type: 'project.save.cancel' })"> Close </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
