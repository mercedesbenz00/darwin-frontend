<template>
  <div class="model-card">
    <div class="model-card__header">
      <annotation-class-icon
        class="model-card__icon"
        :type="modelType"
      />
      <badge
        :label="status.title"
        class="model-card__badge"
        size="medium"
        :color="statusColor"
      />
    </div>
    <div class="model-card__title">
      {{ name }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import AnnotationClassIcon from '@/assets/icons/V2/Duotone/AnnotationClassIcon.vue'
import { Badge } from '@/components/Common/Badge'
import { Status } from '@/components/Common/Status'
import { RunningSessionPayload, TrainingClass } from '@/store/types'

@Component({
  name: 'model-card',
  components: { AnnotationClassIcon, Badge, Status }
})
export default class ModelCard extends Vue {
  @Prop({ type: Object as () => RunningSessionPayload, required: true })
  readonly model!: RunningSessionPayload

  get name (): string {
    return this.model.name
  }

  get isRunning (): boolean {
    return this.model.meta.num_instances_available > 0
  }

  get isStarting (): boolean {
    return this.model.meta.num_instances_starting > 0
  }

  get statusColor (): object {
    if (this.isRunning) {
      return { r: 59, g: 186, b: 59, a: 1 }
    }

    if (this.isStarting) {
      return { r: 240, g: 122, b: 5, a: 1 }
    }

    return { r: 220, g: 24, b: 24, a: 1 }
  }

  get modelType (): TrainingClass['name'] {
    return this.model.meta.classes[0]?.type || ''
  }

  get status (): object {
    if (this.isRunning) {
      return {
        title: 'Running',
        status: 'running'
      }
    }

    if (this.isStarting) {
      return {
        title: 'Starting',
        status: 'offline'
      }
    }

    return {
      title: 'Stopped',
      status: 'draft'
    }
  }
}
</script>

<style lang="scss" scoped>
.model-card {
  padding: 6px;
  border: 1px solid $colorStrokeRaise;
  border-radius: 12px;
  background-color: $colorNeutralsLightWhite;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.03), 0px 1px 2px rgba(16, 24, 40, 0.05);
  color: $colorContentDefault;
  font-family: $fontFamilyInter;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }

  &__header {
    display: flex;
  }

  &__badge {
    margin-left: auto;

    :deep(.badge__content__label) {
      font-size: 0.82rem;
    }
  }

  &__icon {
    flex: 0 0 auto;
    max-height: 20px;
    margin-right: 4px;
    --first-color: #7A18DC !important;
    --second-color: #7A18DC !important;
    --stroke-opacity: 0.85 !important;
    --fill-opacity: 0.3 !important;
  }

  &__title {
    padding: 2px;
    font-size: 14px;
    line-height: 16px;
    font-weight: 500;
  }

  &__status-icon {
    margin-right: 8px;
  }
}
</style>
