<template>
  <ConfigurableUserList :stage="stage" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ConfigurableUserList from '@/components/Stages/StageChilds/ConfigurableUserList.vue'
import { V2AnnotateStagePayload } from '@/store/types/V2WorkflowStagePayload'

export default defineComponent({ 
  name: 'AnnotateStageSidebarChild',
  components: { ConfigurableUserList },
  props: {
    stage: { type: Object as () => V2AnnotateStagePayload, required: true }
  }
})
</script>
