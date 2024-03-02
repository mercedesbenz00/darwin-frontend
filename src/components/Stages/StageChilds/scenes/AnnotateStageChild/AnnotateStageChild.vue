<template>
  <ReadOnlyUserList :stage="stage" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ReadOnlyUserList from '@/components/Stages/StageChilds/ReadOnlyUserList.vue'
import { V2AnnotateStagePayload } from '@/store/types'

export default defineComponent({
  components: { ReadOnlyUserList },
  props: {
    stage: { type: Object as () => V2AnnotateStagePayload, required: true }
  }
})
</script>
