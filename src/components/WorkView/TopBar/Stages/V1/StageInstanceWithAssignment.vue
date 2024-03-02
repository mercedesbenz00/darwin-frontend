<template>
  <stage-item
    class="stage-instance"
    :class="{ 'stage-instance--restartable': canRestart }"
    :item="instance"
    @assign="assignStage"
  >
    <template #main>
      <refresh-icon
        v-if="canRestart"
        v-tooltip="'Restart Workflow'"
        class="stage-instance__restart"
        @click.stop="restartWorkflow"
      />
      <stage-instance
        :disabled="!canSeeStage"
        :instance="instance"
        class="stage-instance__instance"
        @click="selectStageInstance"
      />
    </template>
    <template
      v-if="renderTracking"
      #hover
    >
      <time-summary :stage="instance" />
    </template>
  </stage-item>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { RefreshIcon } from '@/assets/icons/V1'
import StageInstance from '@/components/WorkView/Common/StageInstance.vue'
import TimeSummary from '@/components/WorkView/Common/TimeSummary.vue'
import { assignStage } from '@/store/modules/workview/actions/assignStage'
import {
  DatasetItemPayload,
  DatasetItemStatus,
  MembershipPayload,
  RootState,
  StageTimeState,
  StageType,
  StoreActionPayload,
  UserPayload,
  WorkflowStagePayload
} from '@/store/types'
import { ErrorCodes } from '@/utils/error/errors'

import StageItem from './StageItem.vue'

@Component({
  name: 'stage-instance-with-assignment',
  components: { RefreshIcon, StageInstance, StageItem, TimeSummary }
})
export default class StageInstanceWithAssignment extends Vue {
  @Prop({ required: true, type: Object as () => WorkflowStagePayload })
  instance!: WorkflowStagePayload

  selectStageInstance (): void {
    const { instance } = this
    this.$store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', null)
    this.$store.commit('workview/SET_SELECTED_STAGE_INSTANCE', instance)
  }

  @Getter('stageInstanceTimeState', { namespace: 'workview' })
  getTimeState!: (instance: WorkflowStagePayload) => StageTimeState

  @State(state => state.workview.selectedDatasetItem)
  item!: DatasetItemPayload

  get canRestart (): boolean {
    const { instance, isSelected, item } = this
    return (
      isSelected &&
      item.status === DatasetItemStatus.complete &&
      instance.type === StageType.Complete
    )
  }

  async restartWorkflow (): Promise<void> {
    const { item } = this

    const { error } = await this.$store.dispatch('workview/createWorkflow', item)
    if (error && error.code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
      this.$store.commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
      return
    }

    if (error) { this.$toast.warning({ extended: false, meta: { title: error.message } }) }
  }

  @State(state => state.workview.selectedStageInstance)
  selectedStageInstance!: WorkflowStagePayload | null

  get isSelected (): boolean {
    const { instance, selectedStageInstance } = this
    return !!selectedStageInstance && instance.id === selectedStageInstance.id
  }

  get isCurrent (): boolean {
    return this.getTimeState(this.instance) === StageTimeState.Current
  }

  get isPast (): boolean {
    return this.getTimeState(this.instance) === StageTimeState.Past
  }

  get renderTracking (): boolean {
    const { canRestart, instance, isCurrent, isPast } = this
    return !canRestart && (!!instance.assignee_id || isPast || isCurrent)
  }

  async assignStage (member: MembershipPayload): Promise<void> {
    const { instance: stage } = this
    const payload: StoreActionPayload<typeof assignStage> = { stage, userId: member.user_id }
    const { error } = await this.$store.dispatch('workview/assignStage', payload)

    if (error) {
      const content = error.code === ErrorCodes.ALREADY_IN_WORKFLOW
        ? ['Cannot assign stage.',
          `${member.first_name} is already assigned to a different stage in the workflow.`
        ].join(' ')
        : error.message

      return this.$store.dispatch('toast/warning', { content })
    }
  }

  @State((state: RootState) => state.user.profile)
  user!: UserPayload | null

  get canSeeStage (): boolean {
    const { instance, item, user } = this
    if (!user) { return false }
    if (!instance.assignee_id) { return true }
    if (instance.assignee_id === user.id) { return true }

    // user is not assigned to stage, nor to any other stage
    const stages = item.current_workflow?.stages[instance.number] || []
    if (stages.every(s => s.assignee_id !== user.id)) { return true }

    return false
  }
}
</script>
<style lang="scss" scoped>
.stage-instance__restart {
  height: 30px;
  width: 30px;
  color: $colorWhite;
  background: $colorFeatherLight;
  border-radius: 50%;
  padding: 8px;
  padding-top: 7px;
  padding-bottom: 9px;
  transform: scaleY(-1);
  cursor: pointer;
}

.stage-instance--restartable {
  .stage-instance__instance { display: block; }
  .stage-instance__restart { display: none; }
}

.stage-instance--restartable:hover {
  .stage-instance__instance { display: none; }
  .stage-instance__restart { display: block; }
}

/**
 * We want the content of the stage instance to appear disabled, but not actually
 * pass it all the way down to <team-avatar> or <status-button>
 *
 * Just setting opacity would actually cause it to make the assignment dropdown
 * as opaque as the parent, so instead, we use a pseude-element to achieve the
 * effect.
 */
.stage-instance__instance:disabled::after {
  content: "";
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  border: inherit;
  // same as border width of the <status-button />
   // margin: 2px;
  pointer-events: none;
}
</style>
