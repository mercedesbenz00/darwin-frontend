<template>
  <button
    class="status-button"
    :class="{
      [`status-button--${type}`]: true,
      [`status-button--${type}--active`]: active,
    }"
    v-on="$listeners"
  >
    <slot v-if="$slots.default" />
    <annotate-icon v-else-if="type === 'annotate'" />
    <archived-icon v-else-if="type === 'archived'" />
    <archived-icon v-else-if="type === 'discard'" />
    <brain-icon v-else-if="type === 'model'" />
    <code-icon v-else-if="type === 'code'" />
    <completed-icon v-else-if="type === 'complete'" />
    <dataset-stage-icon v-else-if="type === 'dataset'" />
    <error-icon v-else-if="type === 'error'" />
    <processing-icon v-else-if="type === 'processing'" />
    <rejected-icon v-else-if="type === 'rejected'" />
    <review-icon v-else-if="type === 'review'" />
    <test-icon v-else-if="type === 'test'" />
    <uploading-icon v-else-if="type === 'uploading'" />
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import {
  AnnotateIcon,
  ArchivedIcon,
  BrainIcon,
  CodeIcon,
  CompletedIcon,
  ErrorIcon,
  RejectedIcon,
  ReviewIcon,
  ProcessingIcon,
  TestIcon,
  UploadingIcon
} from '@/assets/icons/V1'
import { IconColoredDataset as DatasetStageIcon } from '@/assets/icons/V2/Colored'
import { DatasetItemStatus, ReviewStatus, StageType } from '@/store/types'

@Component({
  name: 'status-button',
  components: {
    AnnotateIcon,
    ArchivedIcon,
    BrainIcon,
    CodeIcon,
    CompletedIcon,
    DatasetStageIcon,
    ErrorIcon,
    ProcessingIcon,
    RejectedIcon,
    ReviewIcon,
    TestIcon,
    UploadingIcon
  }
})
export default class StatusButton extends Vue {
  @Prop({ required: true, type: String })
  type!: DatasetItemStatus | StageType | ReviewStatus

  @Prop({ default: false, type: Boolean })
  active?: boolean
}
</script>

<style lang="scss" scoped>
.status-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background: $colorAliceBlue;
  border-radius: 50%;
  border-width: 1px;
  border-style: solid;
  height: 36px;
  width: 36px;
  box-sizing: border-box;
  padding: 0;
  z-index: 2;

  @include workflow-status-border-color;
  @include workflow-status-color;

  svg {
    height: 50%;
    width: auto;
  }

  // check icon used by the complete status seems off-center
  // this adjusts it
  &--complete svg { margin-top: 2px }

  transition: all .2s ease-in-out;
  transition-property: background-color, border-color, color;

  // review icon is a circle with an arrow on the bottom ("recycle")
  // this makes it appear smaller and uncentered due to scaling
  // these adjustments fix the appearance
  &--review svg {
    height: 65%;
    width: 65%;
    path {
      stroke-width: 1;
    }
  }

  // test and new icons are a tad small, so this makes them
  // more in line with the rest
  &--new svg,
  &--test svg {
    height: 65%;
    width: 65%;
  }

  &:active.status-button,
  &[class*="--active"].status-button {
    @include workflow-status-background-color;
    color: $colorAliceBlue;

    // used for selected V2Stages
    &:before,
    &:after {
      content: '';
      position: absolute;
      height: 2px;
      left: calc(50% - 2px);
      width: 1px;
      z-index: 2;
      // @include workflow-status-background-color;
    }

    &:before {
      top: -2px;
    }

    &:after {
      bottom: -2px;
    }
  }

  &:hover.status-button {
    @include workflow-status-background-color(0.3);
  }

  &:active,
  &:active:hover,
  &[class*="--active"],
  &[class*="--active"]:hover {
    color: $colorWhite;
  }
}

</style>
