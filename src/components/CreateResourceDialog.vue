<script setup lang="ts">
import { computed, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useVocEditMachine } from '@/composables/vocedit-machine'
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectContent,
} from '@/components/ui/select'
import { skos } from '@/namespaces'
import n3 from 'n3'

const { snapshot, send } = useVocEditMachine()

const isOpen = computed(() => snapshot.value.hasTag('createResourceDialog'))
const formError = ref<string | null>(null)

const { namedNode } = n3.DataFactory

const formSchema = toTypedSchema(
  z.object({
    type: z.enum(['collection', 'concept']),
    iri: z.url(),
  }),
)

const form = useForm({
  validationSchema: formSchema,
})

function resourceTypeToIri(type: string) {
  if (type === 'collection') {
    return namedNode(skos.Collection.value)
  } else if (type === 'concept') {
    return namedNode(skos.Concept.value)
  }

  throw new Error(`Invalid resource type: ${type}`)
}

const onSubmit = form.handleSubmit(
  (values) => {
    formError.value = null
    send({
      type: 'resource.create.confirm',
      data: { type: resourceTypeToIri(values.type), iri: namedNode(values.iri) },
    })
  },
  (errors) => {
    console.log('Form validation errors:', errors)
    formError.value = 'Please fix the validation errors below'
  },
)

const handleCancel = () => {
  send({ type: 'resource.create.cancel' })
}

const handleOpenChange = (open: boolean) => {
  if (!open) {
    formError.value = null
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

      <div>
        <div
          v-if="formError"
          class="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md"
        >
          <p class="text-sm text-destructive">{{ formError }}</p>
        </div>

        <form @submit="onSubmit" class="space-y-6">
          <FormField v-slot="{ componentField }" name="type">
            <FormItem>
              <FormLabel>Resource Type</FormLabel>
              <FormControl>
                <Select v-bind="componentField">
                  <SelectTrigger class="w-[180px]">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Types</SelectLabel>
                      <SelectItem value="collection"> Collection </SelectItem>
                      <SelectItem value="concept"> Concept </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Select the type of resource you want to create.</FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="iri">
            <FormItem>
              <FormLabel>IRI</FormLabel>
              <FormControl>
                <Input v-bind="componentField" placeholder="https://example.org/resource" />
              </FormControl>
              <FormDescription>Enter the IRI of the resource you want to create.</FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>

        <div class="space-y-2"></div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel"> Cancel </Button>
        <Button variant="default" @click="onSubmit"> Create </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
