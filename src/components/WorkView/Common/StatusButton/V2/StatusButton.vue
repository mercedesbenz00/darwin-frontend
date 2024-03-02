<template>
  <button
    class="status-button"
    :class="{
      'status-button--active': active,
      [`status-button--size--${size}`]: true,
      [`status-button--variant--${variant}`]: true,
      [`status-button--${type}`]: true,
    }"
    v-on="$listeners"
    :style="style"
  >
    <slot v-if="$slots.default" />
    <div
      v-else
      class="status-button__icon__wrapper"
    >
      <component
        :is="getComponent(type)"
        v-bind="iconVariant"
      />
    </div>
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import {
  IconColoredAnnotate as AnnotateIcon,
  IconColoredAnnotateInverted as AnnotateIconInverted,
  IconColoredCode as CodeIcon,
  IconColoredCodeInverted as CodeIconInverted,
  IconColoredComplete as CompleteIcon,
  IconColoredCompleteInverted as CompleteIconInverted,
  IconColoredConsensus as ConsensusIcon,
  IconColoredConsensusInverted as ConsensusIconInverted,
  IconColoredDataset as DatasetIcon,
  IconColoredDatasetInverted as DatasetIconInverted,
  IconColoredModel as ModelIcon,
  IconColoredModelInverted as ModelIconInverted,
  IconColoredReview as ReviewIcon,
  IconColoredReviewInverted as ReviewIconInverted,
  IconColoredTest as TestIcon,
  IconColoredTestInverted as TestIconInverted,
  IconColoredWebhook as WebhookIcon,
  IconColoredWebhookInverted as WebhookIconInverted,
} from '@/assets/icons/V2/Colored'
import {
  IconDuotoneTrash as ArchivedIcon,
  IconDuotoneTrashInverted as ArchivedIconInverted,
  IconDuotoneTrash as DiscardIcon,
  IconDuotoneTrashInverted as DiscardIconInverted,
  IconDuotoneUpload as UploadingIcon,
  IconDuotoneUploadInverted as UploadingIconInverted,
  IconDuotoneWarn as ErrorIcon,
  IconDuotoneWarn as ErrorIconInverted
} from '@/assets/icons/V2/Duotone'
import {
  IconMonoIdle as NewIcon,
  IconMonoIdleInverted as NewIconInverted
} from '@/assets/icons/V2/Mono'
import colors from '@/assets/styles/darwin/variables/colors.module.scss'
import { RingLoader } from '@/components/Common/LoadingIndicators/'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { itemTheme } from '@/utils/datasetItemTheme'

import { StatusButtonProps, StatusButtonSize, StatusButtonVariant } from './types'

const variantValidator = (value: string): boolean => ['default', 'inverted'].includes(value)
const sizeValidator = (value: string): boolean => ['xs', 'sm', 'md'].includes(value)

/**
 * @StatusButton - refactored version for the V2 redesign
 * */
@Component({
  name: 'status-button',
  components: {
    AnnotateIcon,
    AnnotateIconInverted,
    ArchivedIcon,
    ArchivedIconInverted,
    CodeIcon,
    CodeIconInverted,
    CompleteIcon,
    CompleteIconInverted,
    ConsensusIcon,
    ConsensusIconInverted,
    DatasetIcon,
    DatasetIconInverted,
    DiscardIcon,
    DiscardIconInverted,
    ErrorIcon,
    ErrorIconInverted,
    ModelIcon,
    ModelIconInverted,
    NewIcon,
    NewIconInverted,
    ReviewIcon,
    ReviewIconInverted,
    RingLoader,
    TestIcon,
    TestIconInverted,
    UploadingIcon,
    UploadingIconInverted,
    WebhookIcon,
    WebhookIconInverted,
  }
})
export default class StatusButton extends Vue {
  readonly colorSurfaceDefault: string = colors.colorSurfaceDefault

  @Prop({ required: true, type: String })
  type!: StatusButtonProps['type']

  @Prop({ default: StatusButtonVariant.DEFAULT, type: String, validator: variantValidator })
  variant!: StatusButtonProps['variant']

  @Prop({ default: StatusButtonSize.XS, type: String, validator: sizeValidator })
  size!: StatusButtonProps['size']

  @Prop({ default: false, type: Boolean })
  active!: StatusButtonProps['active']

  get iconVariant (): { variant?: string } {
    if (this.type !== DatasetItemStatus.error) { return {} }

    return {
      variant: this.variant === StatusButtonVariant.DEFAULT ? 'red' : 'inverted'
    }
  }

  get style (): Partial<{ [key in keyof CSSStyleDeclaration]: string }> {
    const highlightColor = itemTheme[this.type].highlightColor

    if (this.variant === StatusButtonVariant.DEFAULT) {
      return {
        background: this.colorSurfaceDefault,
        border: `2px solid ${highlightColor}`
      }
    } else {
      return {
        background: highlightColor,
        border: `2px solid ${highlightColor}`
      }
    }
  }

  get isNewStatus (): boolean {
    return this.type === 'new'
  }

  getComponent (i: StatusButtonProps['type']): string {
    const suffix = (i == DatasetItemStatus.consensus_entrypoint)? 'consensus': i.toLowerCase()
    if (suffix === DatasetItemStatus.processing) { return 'ring-loader' }
    const inverted = this.variant === StatusButtonVariant.INVERTED
    return `${suffix}-icon${inverted ? '-inverted' : ''}`
  }
}
</script>

<style lang="scss" scoped>
.status-button {
  @include row--center;
  align-items: center;
  border-radius: 100%;
  padding: 0;

  &--size {
    padding: 0;

    &--xs {
      $xs: 20px;
      width: $xs;
      height: $xs;
    }

    &--sm {
      $sm: 23px;
      width: $sm;
      height: $sm;
    }

    &--md {
      $md: 26px;
      width: $md;
      height: $md;
    }
  }

  &__icon__wrapper {
    @include row--center;
    align-items: center;
    width: 100%;
    height: 20px;
  }
}
</style>
