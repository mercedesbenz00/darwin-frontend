<template>
  <div class="stage-complete">
    <chevron-right-icon class="stage-complete__chevron" />
    <img
      v-tooltip="{
        content: 'Complete Stage'
      }"
      class="stage-complete-icon"
      src="/static/imgs/image-status/completed.svg"
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ChevronRightIcon from './assets/chevron-right.svg?inline'

export default defineComponent({
  name: 'WorkflowStageComplete',
  components: { ChevronRightIcon }
})
</script>

<style lang="scss" scoped>
.stage-complete {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
}

.stage-complete__chevron {
  width: 13px;
  margin-right: 8px;
}

.stage-complete-icon {
  width: 36px;
  cursor: pointer;
}
</style>
