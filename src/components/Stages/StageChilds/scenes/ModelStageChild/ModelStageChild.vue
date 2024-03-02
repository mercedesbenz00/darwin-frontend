<template>
  <connected-model-stage-child
    v-if="modelId"
    :stage="stage"
  />
  <disconnected-model-stage-child v-else />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { V2ModelStagePayload } from '@/store/types'

import ConnectedModelStageChild from './Connected.vue'
import DisconnectedModelStageChild from './Disconnected.vue'

export default defineComponent({
  name: 'ModelStageChild',
  components: { ConnectedModelStageChild, DisconnectedModelStageChild },
  props: {
    stage: { required: true, type: Object as () => V2ModelStagePayload }
  },
  setup (props) {
    const modelId = computed((): string => props.stage.config.model_id)

    return { modelId }
  }
})
</script>
