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

const isOpen = computed(() => snapshot.value.hasTag('deleteResourceDialog'))
const resourceToDelete = computed(() => snapshot.value.context.resourceToDelete)

const handleConfirm = () => {
  send({ type: 'resource.delete.confirm' })
}

const handleCancel = () => {
  send({ type: 'resource.delete.cancel' })
}

const handleOpenChange = (open: boolean) => {
  if (!open) {
    handleCancel()
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
        <DialogTitle>Delete Resource</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this resource?
          <span v-if="resourceToDelete" class="block my-2 font-mono font-bold text-sm">
            {{ resourceToDelete.value }}
          </span>
          This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel"> Cancel </Button>
        <Button variant="destructive" @click="handleConfirm"> Delete </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
