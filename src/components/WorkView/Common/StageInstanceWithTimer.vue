<template>
  <div class="instance-wrapper">
    <stage-instance
      class="instance-wrapper__instance"
      :instance="instance"
    />
    <timer
      v-if="instance.completes_at && nextStatus"
      :completes-at="instance.completes_at"
      :class="`instance-wrapper__timer--${nextStatus}`"
      class="instance-wrapper__timer"
      :show-cancel="false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import { Timer } from '@/components/WorkView/Common/Timer'
import {
  WorkflowStagePayload,
  WorkflowTemplatePayload,
  StageActionType,
  DatasetItemStatus,
  StageType
} from '@/store/types'
import { StageActionTypeToStatus } from '@/utils/StageActionTypeToStatus'

import StageInstance from './StageInstance.vue'
import { StageInstanceWithTimerProps } from './types'

@Component({ name: 'stage-instance-with-timer', components: { StageInstance, Timer } })
export default class StageInstanceWithTimer extends Vue implements StageInstanceWithTimerProps {
  @Prop({ required: true, type: Object as () => WorkflowStagePayload })
  instance!: WorkflowStagePayload

  get progressing (): boolean {
    const { instance } = this
    if (instance.metadata.review_status === 'rejected') { return false }
    return true
  }

  @State(state => state.workview.workflowTemplates)
  workflowTemplates!: WorkflowTemplatePayload[]

  get workflowTemplate (): WorkflowTemplatePayload | null {
    const { instance, workflowTemplates } = this
    const template = workflowTemplates.find(
      w => w.workflow_stage_templates.some(t => t.id === instance.workflow_stage_template_id)
    )

    return template || null
  }

  @Getter('stageCurrentAction', { namespace: 'workview' })
  getContinueAction!: (stage: WorkflowStagePayload) => StageActionType

  get nextStatus (): DatasetItemStatus | 'rejected' | StageType | null {
    const { instance } = this
    if (instance.type === StageType.Complete) { return null }
    const nextAction = this.getContinueAction(instance)
    return StageActionTypeToStatus[nextAction]
  }
}
</script>

<style lang="scss" scoped>
.instance-wrapper {
  position: relative;
  height: 100%;
  width: 100%;

  :deep(.instance) {
    height: 100%;
    width: 100%;
  }

  > * {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }

  &__timer {
    @include workflow-status-color;
  }
}
</style>
