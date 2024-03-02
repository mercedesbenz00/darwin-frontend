<template>
  <simple-labeled-value>
    <template #label>
      Remaining:
    </template>
    <template #value>
      {{ value }}
    </template>
    />
  </simple-labeled-value>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import SimpleLabeledValue from './SimpleLabeledValue.vue'

export default defineComponent({
  name: 'CreditRemainingHours',
  components: { SimpleLabeledValue },
  props: {
    value: { required: true, type: Number }
  }
})
</script>
