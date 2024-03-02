<template>
  <custom-button
    v-tooltip="tooltip"
    class="back-to-the-present"
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
import { State, Getter } from 'vuex-class'

import { CustomButton } from '@/components/Common/Button/V2'
import { DatasetItemPayload, WorkflowStagePayload, UserPayload } from '@/store/types'
import { TooltipOptions } from '@/types'

@Component({ name: 'back-to-the-present', components: { CustomButton } })
export default class BackToThePresent extends Vue {
  @State(state => state.workview.selectedDatasetItem)
  datasetItem!: DatasetItemPayload

  @Getter('currentStageInstancesForItem', { namespace: 'workview' })
  currentStageInstancesForItem!: (item: DatasetItemPayload) => WorkflowStagePayload[]

  @State(state => state.user.profile)
  user!: UserPayload

  get tooltip (): TooltipOptions {
    return {
      content: 'Return to current stage',
      delay: { show: 300, hide: 300 }
    }
  }

  selectPresentStage (): void {
    const { user } = this
    const instances = this.currentStageInstancesForItem(this.datasetItem)
    const instance = instances.find(i => i.assignee_id === user.id) || instances[0]
    if (!instance) { return }
    this.$store.commit('workview/SET_SELECTED_STAGE_INSTANCE', instance)
  }
}
</script>

<style lang="scss" scoped>
.back-to-the-present {
  @include row;
  align-items: center;
  border-width: 2px;
  color: $colorAliceNight;
  border-color: $colorAliceNight;

  transition: background-color .2s ease-in-out;
  &:hover {
    background-color: rgba($colorAliceNight, 0.3);
  }

  &:active {
    background: rgba($colorAliceNight, 0.2);
  }
}
</style>
