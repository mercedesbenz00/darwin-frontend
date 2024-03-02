<template>
  <continue-button
    :type="type"
    @restart="restart"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { ContinueButton } from '@/components/WorkView/TopBar/WorkflowControls/Common'
import { useComboHotkeys } from '@/composables/useComboHotkeys'
import { useStore } from '@/composables/useStore'
import { StageActionType } from '@/store/types'

export default defineComponent({
  name: 'CompleteControls',
  components: { ContinueButton },
  setup () {
    const { dispatch, getters } = useStore()

    const type = computed((): StageActionType => {
      return getters['workview/v2StageCurrentAction']
    })

    const restart = (): void => {
      dispatch('workview/restartV2WorkflowItem')
    }

    useComboHotkeys({
      name: 'CompleteControls',
      key: 'Enter',
      shiftKey: true,
      handler: restart
    })

    return {
      type,
      restart
    }
  }
})
</script>
