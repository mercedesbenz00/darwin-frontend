<template>
  <div>
    <dataset-connected-child
      v-if="isConnected"
      :dataset="dataset"
    />
    <dataset-default-child v-else />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import DatasetConnectedChild from '@/components/Stages/StageChilds/scenes/DatasetStageChild/Connected.vue'
import DatasetDefaultChild from '@/components/Stages/StageChilds/scenes/DatasetStageChild/Default.vue'
import { useStore } from '@/composables'
import { DatasetPayload, V2DatasetStagePayload } from '@/store/types'

export default defineComponent({
  name: 'DatasetStageChild',
  components: {
    DatasetConnectedChild,
    DatasetDefaultChild
  },
  props: {
    stage: {
      required: true,
      type: Object as () => V2DatasetStagePayload
    }
  },
  setup (props) {
    const { getters } = useStore()
    const findById: (datasetId: number) => DatasetPayload = getters['dataset/findById']

    const dataset = computed(() => {
      if (!props.stage.config.dataset_id) { return null }
      return findById(props.stage.config.dataset_id)
    })

    const isConnected = computed(() => !!props.stage.config.dataset_id)

    return {
      dataset,
      isConnected
    }
  }
})

</script>
