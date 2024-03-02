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
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { IconColoredReject, IconColoredRejectInverted } from '@/assets/icons/V2/Colored'
import { CustomButton, IconButton } from '@/components/Common/Button/V2'
import { assignStage } from '@/store/modules/workview/actions/assignStage'
import {
  StoreActionPayload,
  UserPayload,
  WorkflowStagePayload
} from '@/store/types'
import { TooltipOptions } from '@/types'
/**
 * The reject button available in review stage.
 *
 * Clicking this button will mark the review stage as rejected and send the
 * button back to the previous stage, using auto-complete. Clicking it again
 * while auto-completing will cancel the auto-complete and reset the review
 * status.
 */
@Component({
  name: 'stage-reject-button',
  components: {
    CustomButton,
    IconButton,
    IconColoredReject,
    IconColoredRejectInverted
  }
})
export default class StageRejectButton extends Vue {
  @Prop({ default: true, type: Boolean as () => boolean })
  icon!: boolean

  @State(state => state.workview.selectedStageInstance)
  stage!: WorkflowStagePayload

  @State(state => state.user.profile)
  user!: UserPayload

  get isRejected (): boolean {
    return this.stage.metadata.review_status === 'rejected'
  }

  get tooltip (): TooltipOptions {
    return {
      content: this.isRejected
        ? 'Cancel rejection of image'
        : 'Reject image (Send the file back)',
      delay: { show: 300, hide: 300 }
    }
  }

  onClick (): void {
    this.isRejected ? this.reset() : this.reject()
  }

  async reset (): Promise<void> {
    const { error } = await this.$store.dispatch('workview/resetStageReviewStatus', this.stage)
    if (error) { this.$toast.warning({ extended: false, meta: { title: error.message } }) }
  }

  async reject (): Promise<void> {
    const { stage, user } = this
    if (!stage.assignee_id) {
      const { id: userId } = user
      const payload: StoreActionPayload<typeof assignStage> = { stage, userId }
      const { error } = await this.$store.dispatch('workview/assignStage', payload)
      if (error) { return this.$store.dispatch('toast/warning', { content: error.message }) }
    }
    const { error } = await this.$store.dispatch('workview/rejectStage', this.stage)
    if (error) { this.$toast.warning({ extended: false, meta: { title: error.message } }) }
  }
}
</script>
