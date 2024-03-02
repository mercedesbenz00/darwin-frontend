<template>
  <custom-button
    v-tooltip="tooltip"
    class="reject-button"
    variant="outline"
    size="small"
    flair="rounded"
    @click="selectPresentStage"
  >
    Back to the present
  </custom-button>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CustomButton } from '@/components/Common/Button/V2'
import {
  RootState,
  UserPayload,
  V2WorkflowStageInstancePayload,
  V2WorkflowItemStatePayload
} from '@/store/types'
import { TooltipOptions } from '@/types'

@Component({ name: 'back-to-the-present', components: { CustomButton } })
export default class BackToThePresent extends Vue {
  @State((state: RootState) => state.workview.v2WorkflowItemState)
  item!: V2WorkflowItemStatePayload | null

  @State(state => state.user.profile)
  user!: UserPayload

  get instance (): V2WorkflowStageInstancePayload | null {
    const { item, user } = this

    // item available and user signed in
    // - return active instance assigned to user
    // - if that fails, return first active instance, if any
    if (item && item.current_stage_instances.length > 0 && user) {
      return (
        item.current_stage_instances.find(i => i.user_id === user.id) ||
        item.current_stage_instances[0] ||
        null
      )
    }

    // item available, but user not signed in
    // - return first active instance, if any
    if (item && item.current_stage_instances.length > 0) {
      return (item.current_stage_instances[0] || null)
    }

    // item not available
    return null
  }

  get tooltip (): TooltipOptions {
    return {
      content: 'Return to current stage',
      delay: { show: 300, hide: 300 }
    }
  }

  selectPresentStage (): void {
    const { instance } = this
    if (!instance) { return }
    this.$store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    this.$store.commit('workview/SET_V2_SELECTED_STAGE', instance.stage)
    this.$store.dispatch(
      'workview/loadV2Annotations',
      this.$store.state.workview.selectedDatasetItemV2Id
    )
  }
}
</script>
