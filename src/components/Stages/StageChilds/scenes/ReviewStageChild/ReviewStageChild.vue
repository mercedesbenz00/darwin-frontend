<template>
  <div>
    <ReviewNode
      :stage="stage"
      :scale="scale"
      variant="accepted"
    />
    <ReviewNode
      :stage="stage"
      :scale="scale"
      variant="rejected"
    />
    <ReadOnlyUserList :stage="stage" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ReadOnlyUserList from '@/components/Stages/StageChilds/ReadOnlyUserList.vue'
import { V2ReviewStagePayload } from '@/store/types'

import ReviewNode from './ReviewNode.vue'
export default defineComponent({
  components: {
    ReadOnlyUserList,
    ReviewNode
  },
  props: {
    scale: { type: Number, required: true },
    stage: { type: Object as () => V2ReviewStagePayload, required: true }
  }
})
</script>
