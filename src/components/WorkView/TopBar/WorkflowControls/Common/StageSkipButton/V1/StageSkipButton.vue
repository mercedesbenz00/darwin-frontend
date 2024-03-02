<template>
  <div class="stage-skip">
    <discard-button
      class="stage-skip__skip-button"
      :skipped-reason="skippedReason"
      @toggle-skip="toggleSkip"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DiscardButton } from '@/components/WorkView/TopBar/WorkflowControls/Common'
import { assignStage } from '@/store/modules/workview/actions/assignStage'
import {
  SkippedReason,
  StoreActionPayload,
  UserPayload,
  WorkflowStagePayload
} from '@/store/types'

/**
 * The "trash" button available to item assignee when the item is in "annotate" stage
 *
 * It toggles auto-completion of stage in a skipped state, with a selected skip reason.
 */
@Component({ name: 'stage-skip-button', components: { DiscardButton } })
export default class StageSkipButton extends Vue {
  @State(state => state.workview.selectedStageInstance)
  stage!: WorkflowStagePayload

  @State(state => state.user.profile)
  user!: UserPayload

  get skippedReason (): SkippedReason {
    const { stage } = this
    if (!stage) { return null }
    return stage.skipped_reason
  }

  toggleSkip (reason: SkippedReason = 'Other'): void {
    const { stage } = this
    if (!stage) { return }
    if (stage.skipped_reason && stage.skipped_reason === reason) {
      this.unskip()
    } else {
      this.skip(reason)
    }
  }

  async skip (reason: SkippedReason): Promise<void> {
    const { stage, user } = this

    if (!stage.assignee_id) {
      const { id: userId } = user
      const payload: StoreActionPayload<typeof assignStage> = { stage, userId }
      const { error } = await this.$store.dispatch('workview/assignStage', payload)
      if (error) { return this.$store.dispatch('toast/warning', { content: error.message }) }
    }

    const { error } = await this.$store.dispatch('workview/skipStage', { stage, reason })
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
    }
  }

  async unskip (): Promise<void> {
    const { error } = await this.$store.dispatch('workview/unskipStage', this.stage)
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
    }
  }
}
</script>
