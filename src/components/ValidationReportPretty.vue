<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import n3 from 'n3'
import { ChevronRight } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { rdf, sh } from '@/namespaces'
import { prettify } from '@/lib/prettify'

interface ValidationResult {
  id: string
  severity: string
  message: string
  focusNode: string
  resultPath?: string
  sourceShape?: string
  sourceShapeTurtle?: string
  sourceConstraintComponent?: string
  value?: string
}

const props = defineProps<{
  dataset: n3.Store | null
}>()

const validationResults = ref<ValidationResult[]>([])

async function parseValidationResults(dataset: n3.Store): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  // Find all validation results using getSubjects
  const validationResults = Array.from(dataset.getSubjects(rdf.type, sh.ValidationResult, null))

  for (const validationResult of validationResults) {
    if (validationResult.termType !== 'NamedNode' && validationResult.termType !== 'BlankNode') {
      continue
    }

    // Get severity
    const [severityTerm] = dataset.getObjects(validationResult, sh.resultSeverity, null)
    const severity = severityTerm?.value || 'Unknown'

    // Get message
    const [messageTerm] = dataset.getObjects(validationResult, sh.resultMessage, null)
    const message = messageTerm?.value || 'No message provided'

    // Get focus node
    const [focusNodeTerm] = dataset.getObjects(validationResult, sh.focusNode, null)
    const focusNode = focusNodeTerm?.value || 'Unknown'

    // Get result path (optional)
    const [resultPathTerm] = dataset.getObjects(validationResult, sh.resultPath, null)
    const resultPath = resultPathTerm?.value

    // Get source shape (optional)
    const [sourceShapeTerm] = dataset.getObjects(validationResult, sh.sourceShape, null)
    const sourceShape = sourceShapeTerm?.value

    // Extract source shape and nested nodes into a new dataset and prettify it
    let sourceShapeTurtle: string | undefined
    if (sourceShapeTerm) {
      const shapeDataset = extractNodeAndNestedNodes(dataset, sourceShapeTerm)
      sourceShapeTurtle = await serializeAndPrettify(shapeDataset)
    }

    // Get source constraint component (optional)
    const [sourceConstraintComponentTerm] = dataset.getObjects(
      validationResult,
      sh.sourceConstraintComponent,
      null,
    )
    const sourceConstraintComponent = sourceConstraintComponentTerm?.value

    // Get value (optional)
    const [valueTerm] = dataset.getObjects(validationResult, sh.value, null)
    const value = valueTerm?.value

    results.push({
      id: validationResult.value,
      severity,
      message,
      focusNode,
      resultPath,
      sourceShape,
      sourceShapeTurtle,
      sourceConstraintComponent,
      value,
    })
  }

  return results
}

/**
 * Extracts a node and all its nested blank nodes into a new dataset
 */
function extractNodeAndNestedNodes(dataset: n3.Store, node: n3.Term): n3.Store {
  const newDataset = new n3.Store()
  const processedNodes = new Set<string>()
  const nodesToProcess: n3.Term[] = [node]

  while (nodesToProcess.length > 0) {
    const currentNode = nodesToProcess.shift()!
    const nodeId = currentNode.value

    // Skip if already processed
    if (processedNodes.has(nodeId)) {
      continue
    }
    processedNodes.add(nodeId)

    // Get all quads where this node is the subject
    for (const quad of dataset.match(currentNode, null, null, null)) {
      newDataset.add(quad)

      // If the object is a blank node, add it to the queue for processing
      if (quad.object.termType === 'BlankNode') {
        const objectId = quad.object.value
        if (!processedNodes.has(objectId)) {
          nodesToProcess.push(quad.object as n3.Term)
        }
      }
    }
  }

  return newDataset
}

/**
 * Serializes a dataset to Turtle format and prettifies it
 */
async function serializeAndPrettify(dataset: n3.Store): Promise<string> {
  const writer = new n3.Writer({
    format: 'text/turtle',
    prefixes: {
      dcat: 'http://www.w3.org/ns/dcat#',
      dcterms: 'http://purl.org/dc/terms/',
      owl: 'http://www.w3.org/2002/07/owl#',
      prov: 'http://www.w3.org/ns/prov#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      schema: 'https://schema.org/',
      sh: 'http://www.w3.org/ns/shacl#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
    },
  })

  return new Promise((resolve, reject) => {
    writer.addQuads(Array.from(dataset))
    writer.end(async (err, result) => {
      if (err) {
        reject(err)
        return
      }
      try {
        const prettified = await prettify(result)
        resolve(prettified)
      } catch {
        // If prettify fails, return the raw Turtle
        resolve(result)
      }
    })
  })
}

function getSeverityLabel(severity: string): string {
  if (severity.includes('Violation')) return 'Violation'
  if (severity.includes('Warning')) return 'Warning'
  if (severity.includes('Info')) return 'Info'
  return severity.split('#').pop() || severity
}

function getSeverityVariant(severity: string): 'destructive' | 'default' | 'secondary' | 'outline' {
  if (severity.includes('Violation')) return 'destructive'
  if (severity.includes('Warning')) return 'default'
  return 'secondary'
}

function formatIRI(iri: string): string {
  // Try to extract a readable name from the IRI
  const parts = iri.split(/[#/]/)
  return parts[parts.length - 1] || iri
}

const groupedResults = computed(() => {
  const groups: Record<string, ValidationResult[]> = {}
  for (const result of validationResults.value) {
    const severity = getSeverityLabel(result.severity)
    if (!groups[severity]) {
      groups[severity] = []
    }
    groups[severity].push(result)
  }
  // Order: Violations first, then Warnings, then Info
  const orderedGroups: Record<string, ValidationResult[]> = {}
  if (groups['Violation']) orderedGroups['Violation'] = groups['Violation']
  if (groups['Warning']) orderedGroups['Warning'] = groups['Warning']
  if (groups['Info']) orderedGroups['Info'] = groups['Info']
  // Add any other severities
  for (const [key, value] of Object.entries(groups)) {
    if (!orderedGroups[key]) {
      orderedGroups[key] = value
    }
  }
  return orderedGroups
})

const hasResults = computed(() => validationResults.value.length > 0)
const totalCount = computed(() => validationResults.value.length)

watch(
  () => props.dataset,
  async (dataset) => {
    if (dataset) {
      validationResults.value = await parseValidationResults(dataset)
    } else {
      validationResults.value = []
    }
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="hasResults || dataset" class="space-y-4">
    <!-- Human-friendly validation results -->
    <div v-if="hasResults" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">Validation Results</h3>
          <p class="text-sm text-muted-foreground mt-1">
            Found {{ totalCount }} {{ totalCount === 1 ? 'issue' : 'issues' }}
          </p>
        </div>
      </div>

      <div v-for="(results, severity) in groupedResults" :key="severity" class="space-y-3">
        <div class="flex items-center gap-2">
          <Badge :variant="getSeverityVariant(results[0].severity)" class="text-xs">
            {{ severity }}
          </Badge>
          <span class="text-sm text-muted-foreground">
            {{ results.length }} {{ results.length === 1 ? 'issue' : 'issues' }}
          </span>
        </div>

        <div class="space-y-2">
          <Card
            v-for="result in results"
            :key="result.id"
            class="border-l-4"
            :class="{
              'border-l-destructive': severity === 'Violation',
              'border-l-yellow-500': severity === 'Warning',
              'border-l-blue-500': severity === 'Info',
            }"
          >
            <CardHeader class="pb-3">
              <CardTitle class="text-sm font-medium">
                {{ result.message }}
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <div>
                <span class="font-medium text-muted-foreground">Focus Node:</span>
                <span class="ml-2 font-mono text-xs">{{ formatIRI(result.focusNode) }}</span>
              </div>
              <div v-if="result.resultPath">
                <span class="font-medium text-muted-foreground">Path:</span>
                <span class="ml-2 font-mono text-xs">{{ formatIRI(result.resultPath) }}</span>
              </div>
              <div v-if="result.value">
                <span class="font-medium text-muted-foreground">Value:</span>
                <span class="ml-2 font-mono text-xs">{{ result.value }}</span>
              </div>
              <div v-if="result.sourceConstraintComponent">
                <span class="font-medium text-muted-foreground">Source Constraint Component:</span>
                <span class="ml-2 font-mono text-xs">{{
                  formatIRI(result.sourceConstraintComponent)
                }}</span>
              </div>
              <div v-if="result.sourceShape">
                <span class="font-medium text-muted-foreground">Source Shape:</span>
                <span class="ml-2 font-mono text-xs">{{ formatIRI(result.sourceShape) }}</span>
              </div>
              <Collapsible v-if="result.sourceShapeTurtle" class="mt-2">
                <template #default="{ open }">
                  <CollapsibleTrigger as-child>
                    <button
                      class="flex items-center gap-2 w-full text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      <ChevronRight
                        :class="['h-3 w-3 transition-transform', open ? 'rotate-90' : '']"
                      />
                      <span>View Source Shape Details</span>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent class="mt-2 pl-5 border-l-2 border-muted">
                    <div class="bg-muted/50 rounded-lg p-3 mt-2">
                      <pre
                        class="text-xs leading-relaxed font-mono text-muted-foreground overflow-auto"
                        >{{ result.sourceShapeTurtle }}</pre
                      >
                    </div>
                  </CollapsibleContent>
                </template>
              </Collapsible>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Success message when no issues -->
    <div v-if="!hasResults && dataset" class="flex items-center justify-center h-32">
      <div class="text-center space-y-2">
        <div class="text-green-600 text-2xl">✓</div>
        <p class="text-sm font-medium">Validation passed</p>
        <p class="text-xs text-muted-foreground">No issues found in the data graph</p>
      </div>
    </div>
  </div>
</template>
