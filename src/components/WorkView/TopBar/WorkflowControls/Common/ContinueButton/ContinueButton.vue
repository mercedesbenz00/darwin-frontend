<template>
  <custom-button
    class="continue__button"
    :class="{
      [`continue__button--${nextStatus}`]: true,
      'continue__button--in-progress': completesAt,
      'continue__button--restartable': canRestart,
      'continue__button--waiting': waiting,
      'continue__button--disabled': isDisabled
    }"
    :color="color"
    size="small"
    flair="rounded"
    :disabled="isDisabled"
    @click="onClick"
  >
    <template #prefix-icon>
      <timer
        v-if="showTimer"
        :completes-at="completesAt || 0"
        @click.stop.prevent="$emit('cancel')"
      />
    </template>
    <span
      v-if="canRestart"
      class="continue__button__content__restart"
    >
      Restart Workflow
    </span>
    <span v-else>
      {{ showTimer ? 'Cancel' : text }}
    </span>
  </custom-button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { CustomButton, ButtonColor } from '@/components/Common/Button/V2'
import { Timer } from '@/components/WorkView/Common/Timer'
import { DatasetItemStatus, StageActionType, StageType } from '@/store/types'
import { StageActionTypeToStatus } from '@/utils/StageActionTypeToStatus'

/** Defines which label the button will have for each possible action */
const StageActionTypeToText: { [k in StageActionType]: string } = {
  [StageActionType.Archive]: 'Send to Archive',
  [StageActionType.Archived]: 'Archived',
  [StageActionType.Completed]: 'Complete',
  [StageActionType.MarkAsComplete]: 'Mark as Complete',
  [StageActionType.New]: 'New Image',
  [StageActionType.SendBack]: 'Send Back',
  [StageActionType.SendToAnnotate]: 'Send to Annotate',
  [StageActionType.SendToConsensus]: 'Send to Consensus',
  [StageActionType.SendToLogic]: 'Send to Logic',
  [StageActionType.SendToNextReview]: 'Send to next Review',
  [StageActionType.SendToReview]: 'Send to Review',
  [StageActionType.Skip]: 'Send to Review',
  [StageActionType.SendToModel]: 'Send to Model',
  [StageActionType.SendToCode]: 'Send to Code',
  [StageActionType.SendToTest]: 'Mark as Ready for Test',
  // shoudn't be really used as webhook are read-only and automatically advanced
  [StageActionType.SendToWebhook]: 'Send to Webhook'
}

/** Defines which label the button will have for each possible action */
const StageActionTypeToInProgressText: { [k in StageActionType]: string } = {
  [StageActionType.Archive]: 'Sending to Archive',
  [StageActionType.Archived]: 'Archived',
  [StageActionType.Completed]: 'Complete',
  [StageActionType.MarkAsComplete]: 'Marking Complete',
  [StageActionType.New]: 'New Image',
  [StageActionType.SendBack]: 'Sending Back',
  [StageActionType.SendToAnnotate]: 'Sending to Annotate',
  [StageActionType.SendToConsensus]: 'Sending to Consensus',
  [StageActionType.SendToLogic]: 'Sending to Logic',
  [StageActionType.SendToNextReview]: 'Send to Next Review',
  [StageActionType.SendToReview]: 'Sending to Review',
  [StageActionType.Skip]: 'Sending to Review',
  [StageActionType.SendToModel]: 'Sending to AI',
  [StageActionType.SendToCode]: 'Sending to Code',
  [StageActionType.SendToTest]: 'Sending to Test',
  // shoudn't be really used as webhook are read-only and automatically advanced
  [StageActionType.SendToWebhook]: 'Sending to Webhook'
}

@Component({
  name: 'continue-button',
  components: { CustomButton, Timer }
})
export default class ContinueButton extends Vue {
  @Prop({ required: true, type: String as () => StageActionType })
  type!: StageActionType

  @Prop({ required: false, type: Number || null, default: null })
  completesAt!: number | null

  @Prop({ required: false, type: Boolean as () => boolean, default: false })
  waiting!: boolean

  get showTimer (): boolean {
    return !!this.completesAt
  }

  get text (): string {
    const { completesAt, type, waiting } = this
    if (completesAt) { return StageActionTypeToInProgressText[type] || 'Unknown' }
    if (waiting) { return 'Waiting for others' }
    return StageActionTypeToText[type] || 'Unknown'
  }

  get canRestart (): boolean {
    const { type } = this
    return type === StageActionType.Completed
  }

  get nextStatus (): DatasetItemStatus | StageType | 'rejected' {
    const { type } = this
    return StageActionTypeToStatus[type]
  }

  get isDisabled (): boolean {
    const { type } = this
    return type === StageActionType.New || type === StageActionType.Archived
  }

  get isNew (): boolean {
    const { type } = this
    return type === StageActionType.New
  }

  get isArchive (): boolean {
    const { type } = this
    return type === StageActionType.Archive || type === StageActionType.Archived
  }

  get isComplete (): boolean {
    const { type } = this
    return type === StageActionType.Completed || type === StageActionType.MarkAsComplete
  }

  get isReview (): boolean {
    const { type } = this
    return type === StageActionType.SendToReview || type === StageActionType.SendToNextReview
  }

  get color (): ButtonColor {
    const { isArchive, isComplete, isNew, isReview } = this
    if (isNew) {
      return ButtonColor.STAGE_NEW
    } else if (isReview) {
      return ButtonColor.STAGE_REVIEW
    } else if (isComplete) {
      return ButtonColor.STAGE_COMPLETE
    } else if (isArchive) {
      return ButtonColor.NEGATIVE
    }
    return ButtonColor.PRIMARY
  }

  onClick (): void {
    const { completesAt, canRestart, waiting } = this
    if (completesAt) {
      this.$emit('cancel')
      return
    } else if (waiting) {
      return
    } else if (canRestart) {
      this.$emit('restart')
      return
    }
    this.$emit('continue')
  }
}
</script>

<style lang="scss" scoped>
.continue__button {
  @include row--distributed;
  align-items: center;
  color: $colorNeutralsWhite;

  &--disabled,
  &[disabled] {
    opacity: 0.5;
  }
}
</style>
