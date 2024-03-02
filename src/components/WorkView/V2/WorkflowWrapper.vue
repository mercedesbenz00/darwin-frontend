<template>
  <Workflow />
</template>
<script setup lang="ts">
/**
 * We can't provide and inject within the same setup block, so the v2 Workflow
 * component needs this wrapper which provides the editor instance to it.
 */
import { computed } from 'vue'

import { useSelectedDatasetItemV2 } from '@/composables'
import { useEditorV2 } from '@/composables/useEditorV2'
import { LayoutConfig, ViewConfig } from '@/engineV2/layout'

import Workflow from './Workflow.vue'
const { initEditor } = useEditorV2()

const selectedDatasetItem = useSelectedDatasetItemV2()
const layout = computed<LayoutConfig>(() => {
  const { slots, layout } = selectedDatasetItem.value
  const views = [...slots]
    .sort((a, b) => {
      const indexA = layout?.slots?.indexOf(a.slot_name) || 0
      const indexB = layout?.slots?.indexOf(b.slot_name) || 0
      return indexA - indexB
    })
    .map<ViewConfig>(file => ({
      file,
      item: selectedDatasetItem.value
    }))

  return {
    type: layout?.type || 'simple',
    views
  }
})

initEditor(layout.value)

</script>
