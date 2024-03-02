<template>
  <custom-button
    size="small"
    tag="router-link"
    flair="rounded"
    color="negative"
    :to="{ name: 'Workflows' }"
  >
    Start a workflow
  </custom-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { CustomButton } from '@/components/Common/Button/V2'

export default defineComponent({
  name: 'NoWorkflowControls',
  components: {
    CustomButton
  }
})
</script>
