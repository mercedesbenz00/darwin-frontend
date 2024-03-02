<template>
  <div class="dataset-stage-default__container">
    <custom-button
      color="primary"
      size="small"
      flair="rounded"
      full-width
    >
      Connect Dataset
    </custom-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { CustomButton } from '@/components/Common/Button/V2'

export default defineComponent({
  name: 'DatasetDefaultChild',
  components: { CustomButton }
})
</script>

<style lang="scss" scoped>
.dataset-stage-default__container {
  padding: 8px;
}
</style>
