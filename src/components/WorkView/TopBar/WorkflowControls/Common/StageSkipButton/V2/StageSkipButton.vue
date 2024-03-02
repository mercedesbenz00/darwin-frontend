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
import {
  skipV2SelectedStageInstance
} from '@/store/modules/workview/actions/skipV2SelectedStageInstance'
import {
  RootState,
  SkippedReason,
  StoreActionPayload,
  UserPayload,
  V2WorkflowStageInstancePayload
} from '@/store/types'

/**
 * It toggles auto-completion of stage in a skipped state, with a selected skip reason.
 */
@Component({ name: 'v2-stage-skip-button', components: { DiscardButton } })
export default class StageSkipButton extends Vue {
  @State((state: RootState) => state.workview.v2SelectedStageInstance)
  instance!: V2WorkflowStageInstancePayload | null

  @State(state => state.user.profile)
  user!: UserPayload

  get skippedReason (): SkippedReason {
    const { instance } = this
    if (!instance) { return null }
    return instance.data.skipped_reason || null
  }

  toggleSkip (reason: SkippedReason = 'Other'): void {
    const { instance } = this
    if (!instance) { return }
    if (instance.data.skipped_reason && instance.data.skipped_reason === reason) {
      this.skip(null)
    } else {
      this.skip(reason)
    }
  }

  async skip (reason: SkippedReason): Promise<void> {
    const { instance } = this
    if (!instance) { return }

    const payload: StoreActionPayload<typeof skipV2SelectedStageInstance> = reason
    const { error } = await this.$store.dispatch('workview/skipV2SelectedStageInstance', payload)
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
    }
  }
}
</script>
