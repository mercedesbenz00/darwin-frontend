<template>
  <div class="workflow-card__stats">
    <div class="workflow-card__stats__row workflow-card__stats__row__first">
      <attribute-stack
        class="workflow-card__stats__attribute-stack workflow-card__stats__attribute-stack__items"
      >
        <template #primary-attribute>
          {{ progress.total || '-' }}
        </template>
        <template #secondary-attribute>
          Items
        </template>
      </attribute-stack>
      <attribute-stack
        class="workflow-card__stats__attribute-stack
               workflow-card__stats__attribute-stack__complete"
      >
        <template #primary-attribute>
          {{ progress.complete || '-' }}
        </template>
        <template #secondary-attribute>
          Completed
        </template>
      </attribute-stack>
      <attribute-stack
        class="workflow-card__stats__attribute-stack
               workflow-card__stats__attribute-stack__in-progress"
      >
        <template #primary-attribute>
          {{ progress.inProgress || '-' }}
        </template>
        <template #secondary-attribute>
          In progress
        </template>
      </attribute-stack>
    </div>
    <div class="workflow-card__stats__row workflow-card__stats__row__second">
      <div
        v-tooltip="{
          content: progressTooltip,
          placement: 'top',
          delay: { show: 300 },
          classes: 'tooltip--workflow-card'
        }"
        class="workflow-card__stats__progress"
      >
        <div class="workflow-card__stats__progress__bar">
          <progress-bar :value="progressValue" />
        </div>
        <div class="workflow-card__stats__progress__label">
          {{ progressPercentage }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import AttributeStack from '@/components/Common/AttributeStack/AttributeStack.vue'
import ProgressBar from '@/components/Common/ProgressBar/ProgressBar.vue'
import { formatNumericValue } from '@/utils'

import { Progress } from './types'

@Component({
  name: 'workflow-stats',
  components: { AttributeStack, ProgressBar }
})
export default class WorkflowCard extends Vue {
  @Prop({ type: Object })
  value!: Progress

  get progress (): any {
    const { total, complete, in_progress: inProgress } = this.value ||
      { total: 0, complete: 0, in_progress: 0 }
    return {
      total: formatNumericValue(total),
      complete: formatNumericValue(complete),
      inProgress: formatNumericValue(inProgress)
    }
  }

  get progressValue (): number {
    const { total, complete } = this.value ||
      { total: 0, complete: 0 }
    if (!total) { return 0 }
    return (complete / total)
  }

  get progressPercentage (): string {
    return (this.progressValue * 100).toFixed(1)
  }

  get progressTooltip (): string {
    if (!this.progressPercentage) { return '' }
    return `${this.progressPercentage}% Completed`
  }
}
</script>

<style lang="scss" scoped>
.workflow-card__stats {
  @include col;
  align-items: stretch;
  gap: 2px;

  &__row {
    @include row--distributed;

    &__first {
      gap: 2px;
      margin-bottom: 4px;
    }
  }

  &__attribute-stack {
    height: 100%;
    width: 100%;
  }

  &__progress {
    @include row--distributed;
    align-items: center;
    width: 100%;

    &__bar {
      width: 100%;
    }

    &__label {
      margin-left: 12px;
      text-transform: capitalize;
      color: $colorContentTertiary;
      @include typography(md, inter);
    }
  }
}
</style>
