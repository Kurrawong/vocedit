<script setup lang="ts">
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useVocEditMachine } from '@/composables/vocedit-machine'

const { snapshot, send } = useVocEditMachine()

const isOpen = computed(() => snapshot.value.matches({ opened: 'createResourceDialog' }))

const handleConfirm = () => {
  send({ type: 'resource.create.confirm' })
}

const handleCancel = () => {
  send({ type: 'resource.create.cancel' })
}

const handleOpenChange = (open: boolean) => {
  if (!open) {
    send({ type: 'resource.create.cancel' })
  }
}

const handlePointerDownOutside = (event: Event) => {
  event.preventDefault()
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogContent
      :disable-outside-pointer-events="true"
      @pointer-down-outside="handlePointerDownOutside"
    >
      <DialogHeader>
        <DialogTitle>Create Resource</DialogTitle>
        <DialogDescription> Select the type of resource you want to create. </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel"> Cancel </Button>
        <Button variant="default" @click="handleConfirm"> Create </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
