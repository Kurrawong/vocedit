<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import n3 from 'n3'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useVocEditMachine } from '@/composables/vocedit-machine'
import { useResourceManagerContext } from '@kurrawongai/shacl-ui'

const { snapshot, send } = useVocEditMachine()
const isOpen = computed(() => snapshot.value.matches({ opened: 'validationReport' }))
const { dataGraphPointer, validator } = useResourceManagerContext()
const validationReport = ref('')

async function generateValidationReport() {
  try {
    validator.value.validationEngine.initReport()
    const result = await validator.value.validate(dataGraphPointer.value)
    const writer = new n3.Writer({
      format: 'text/turtle',
      prefixes: {
        dcat: 'http://www.w3.org/ns/dcat#',
        dcterms: 'http://purl.org/dc/terms/',
        owl: 'http://www.w3.org/2002/07/owl#',
        prov: 'http://www.w3.org/ns/prov#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        schema: 'https://schema.org/',
        sh: 'http://www.w3.org/ns/shacl#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
      },
    })
    writer.addQuads(Array.from(result.dataset))
    writer.end((err, result) => {
      if (err) {
        console.error('Error serializing validation report:', err)
        validationReport.value = 'Error generating validation report'
      } else {
        validationReport.value = result
      }
    })
  } catch (error) {
    console.error('Error generating validation report:', error)
    validationReport.value = 'Error generating validation report'
  }
}

watch(
  dataGraphPointer,
  () => {
    generateValidationReport()
  },
  { immediate: true, deep: true },
)

function handleClose() {
  send({ type: 'validation.view.report.close' })
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent
      :disable-outside-pointer-events="true"
      @pointer-down-outside="(event) => event.preventDefault()"
      class="sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]"
    >
      <DialogHeader class="px-6 pt-6 pb-4">
        <div class="flex items-center justify-between">
          <div>
            <DialogTitle class="text-xl font-semibold">Validation Report</DialogTitle>
            <DialogDescription class="mt-2 text-sm text-muted-foreground">
              SHACL validation results for the current data graph
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <Separator />

      <div class="flex-1 overflow-hidden">
        <div class="h-full overflow-y-auto px-6 py-4">
          <div v-if="validationReport" class="space-y-4">
            <div class="bg-muted/50 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium text-foreground">Validation Report</h3>
                <Badge variant="outline" class="text-xs">Turtle</Badge>
              </div>
              <pre
                class="text-xs leading-relaxed whitespace-pre-wrap font-mono text-muted-foreground bg-background/50 p-3 rounded border overflow-x-auto"
                >{{ validationReport }}</pre
              >
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-32 text-muted-foreground">
            <p class="text-sm">No validation report available</p>
          </div>
        </div>
      </div>

      <Separator />

      <DialogFooter class="px-6 pb-6 pt-4">
        <Button variant="outline" @click="handleClose"> Close </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
