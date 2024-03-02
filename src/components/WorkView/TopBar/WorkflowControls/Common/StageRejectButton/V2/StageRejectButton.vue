<template>
  <div v-tooltip="tooltip">
    <icon-button
      v-if="icon"
      class="reject-button"
      :variant="isRejected ? 'default' : 'outline'"
      size="small"
      :color="isRejected ? 'negative' : 'secondary'"
      flair="rounded"
      @click="onClick"
    >
      <icon-colored-reject-inverted v-if="isRejected" />
      <icon-colored-reject v-else />
    </icon-button>
    <custom-button
      v-else
      class="reject-button"
      :variant="isRejected ? 'default' : 'outline'"
      size="small"
      :color="isRejected ? 'negative' : 'secondary'"
      flair="rounded"
      @click="onClick"
    >
      {{ isRejected ? 'Rejected' : 'Reject' }}
    </custom-button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { IconColoredReject, IconColoredRejectInverted } from '@/assets/icons/V2/Colored'
import { CustomButton, IconButton } from '@/components/Common/Button/V2'
import { useStore } from '@/composables'
import { TooltipOptions } from '@/types'

/**
 * The reject button available in review stage.
 *
 * Clicking this button will mark the review stage as rejected and send the
 * button back to the previous stage, using auto-complete. Clicking it again
 * while auto-completing will cancel the auto-complete and reset the review
 * status.
 */
export default defineComponent({
  name: 'StageRejectButton',
  components: {
    CustomButton,
    IconButton,
    IconColoredReject,
    IconColoredRejectInverted
  },
  props: {
    icon: { default: true, type: Boolean as () => boolean }
  },
  setup (props, { emit }) {
    const { state } = useStore()

    const stage = computed(() => state.workview.v2SelectedStageInstance)

    const isRejected = computed((): boolean => {
      return stage.value?.data?.active_edge === 'rejected'
    })

    const tooltip = computed((): TooltipOptions => {
      return {
        content: isRejected.value
          ? 'Cancel rejection of image'
          : 'Reject image (Send the file back)',
        delay: { show: 300, hide: 300 }
      }
    })

    const onClick = (): void => {
      emit('click')
    }

    return {
      isRejected,
      tooltip,
      onClick
    }
  }
})
</script>
