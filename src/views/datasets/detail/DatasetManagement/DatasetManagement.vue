<template>
  <router-view :dataset="dataset" />
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'

import { useStore } from '@/composables'
import { DatasetPayload } from '@/store/types'

export default defineComponent({
  name: 'DatasetManagement',
  props: {
    dataset: {
      required: true,
      type: Object as () => DatasetPayload
    }
  },
  setup (props) {
    const store = useStore()
    onMounted(async () => {
      const dataset = props.dataset
      store.commit('dataset/SET_CURRENT_DATASET_ID', dataset.id)
      if (props.dataset.version === 2) {
        return
      }
      await store.dispatch('dataset/loadAndSelectDatasetDetails', { dataset })
      await store.dispatch('dataset/loadWorkflowTemplate', {
        id: dataset.default_workflow_template_id
      })
    })
  }
})
</script>
