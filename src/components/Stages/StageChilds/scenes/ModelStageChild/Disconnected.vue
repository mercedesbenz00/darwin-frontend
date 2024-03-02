<template>
  <div class="disconnected-model-stage-child">
    <div>
      <input-field
        disabled
        placeholder="No model connected"
        value=""
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { InputField } from '@/components/Common/InputField/V2'

export default defineComponent({
  name: 'DisconnectedModelStageChild',
  components: { InputField }
})
</script>

<style lang="scss" scoped>
.disconnected-model-stage-child {
  padding: 8px;
  font-family: $fontFamilyInter;
  font-weight: 500;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
}
</style>
