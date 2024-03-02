<template>
  <continue-button :type="type" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { ContinueButton } from '@/components/WorkView/TopBar/WorkflowControls/Common'
import { StageActionType } from '@/store/types'

export default defineComponent({
  name: 'DiscardControls',
  components: { ContinueButton },
  setup () {
    const type = StageActionType.Archived

    return {
      type
    }
  }
})
</script>
