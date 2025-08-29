<script setup lang="ts">
import { ref } from 'vue'
import { showOpenFilePicker, showSaveFilePicker } from 'show-open-file-picker'

const content = ref('')
const fileHandle = ref()

const filePickerOptions = {
  types: [
    {
      description: 'Turtle (.ttl)',
      accept: {
        'text/turtle': ['.ttl'],
      },
    },
  ],

  multiple: false,
  excludeAcceptAllOption: true,
}

async function handleClick() {
  console.log('open button clicked')
  const [fh] = await showOpenFilePicker(filePickerOptions)
  const file = await fh.getFile()
  content.value = await file.text()
  fileHandle.value = fh
}

async function handleSave() {
  console.log('save button clicked')
  const writer = await fileHandle.value.createWritable({
    keepExistingData: false,
  })
  await writer.write(content.value)
  await writer.close()
}

async function handleSaveAs() {
  console.log('save as button clicked')
  const fh = await showSaveFilePicker({
    suggestedName: 'Untitled.ttl',
  })
  const writer = await fh.createWritable()
  await writer.write(content.value)
  await writer.close()
}
</script>

<template>
</template>
