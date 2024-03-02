<template>
  <div
    class="filter"
    v-if="workflow"
  >
    <h3 class="filter__title">
      Active workflow
    </h3>
    <div class="filter__options">
      <div
        v-for="stage in stages"
        :key="stage.id"
        v-tooltip="tooltip(stage)"
        class="filter__option"
        :class="{
          'filter__option--positive': includedIds.includes(stage.id),
          'filter__option--negative': excludedIds.includes(stage.id)
        }"
      >
        <status-button
          class="filter__option__icon"
          :type="stage.type"
          @click="toggleStage(stage)"
        />
      </div>
      <div
        v-for="stage in otherStages"
        :key="stage.id"
        v-tooltip="tooltip(stage)"
        class="filter__option filter__option--other"
        :class="{
          'filter__option--positive': includedIds.includes(stage.id),
          'filter__option--negative': excludedIds.includes(stage.id)
        }"
      >
        <status-button
          class="filter__option__icon"
          :type="stage.type"
          @click="toggleStage(stage)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import capitalize from 'lodash/capitalize'
import { Component, Vue, Prop } from 'vue-property-decorator'

import StatusButton from '@/components/WorkView/Common/StatusButton/V1/StatusButton.vue'
import { DatasetPayload, V2WorkflowPayload, V2WorkflowStagePayload } from '@/store/types'
import { resolveNextTriToggleStatus, TriToggleStatus } from '@/utils'
import { getStagesPath, getOtherStages } from '@/utils/workflows'

import { StageFilterChange, StageFilterProps } from './types'

/**
 * Allows filtering by WF2.0 current stage ids, inclusive or exclusive
 *
 * Renders UI nearly identical to that of the 1.0 stage template id filter, with a difference that
 * 2.0 workflows have disconnected special stages, such as "Discard" which are also rendered, but
 * not visually connected by arrow indicators.
 */
@Component({
  name: 'stage-filter',
  components: { StatusButton }
})
export default class StageFilter extends Vue implements StageFilterProps {
  @Prop({ default: () => [], type: Array as () => V2WorkflowStagePayload['id'][] })
  includedIds!: V2WorkflowStagePayload['id'][]

  @Prop({ default: () => [], type: Array as () => V2WorkflowStagePayload['id'][] })
  excludedIds!: V2WorkflowStagePayload['id'][]

  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @Prop({ required: true, type: Object as () => V2WorkflowPayload })
  workflow!: V2WorkflowPayload

  /** Happy path stages of the connected 2.0 workflow */
  get stages (): V2WorkflowStagePayload[] {
    const allStages = this.workflow.stages
    return getStagesPath(allStages)
  }

  /** Disconnected special stages of the connected 2.0 workflow */
  get otherStages (): V2WorkflowStagePayload[] {
    const allStages = this.workflow?.stages
    return getOtherStages(allStages)
  }

  /** Shows stage name when hovering over the icon. Falls back to stage type */
  tooltip (stage: V2WorkflowStagePayload): string {
    return stage.name || capitalize(stage.type)
  }

  /** Returns toggle status for the specified stage, based on current props */
  getStatus (stage: V2WorkflowStagePayload): TriToggleStatus {
    if (this.includedIds.includes(stage.id)) { return 'positive' }
    if (this.excludedIds.includes(stage.id)) { return 'negative' }
    return 'none'
  }

  toggleStage (stage: V2WorkflowStagePayload): void {
    const currentStatus = this.getStatus(stage)
    const nextStatus = resolveNextTriToggleStatus(currentStatus)

    const includedIds = currentStatus === 'positive'
      ? this.includedIds.filter(pid => pid !== stage.id)
      : [...this.includedIds]

    const excludedIds = currentStatus === 'negative'
      ? this.excludedIds.filter(pid => pid !== stage.id)
      : [...this.excludedIds]

    if (nextStatus === 'positive') {
      includedIds.push(stage.id)
    } else if (nextStatus === 'negative') {
      excludedIds.push(stage.id)
    }

    const payload: StageFilterChange = { includedIds, excludedIds }
    this.$emit('change', payload)
  }
}
</script>

<style lang="scss" scoped>
.filter {
  display: grid;
  grid-auto-flow: row;
}

.filter__title {
  @include typography(sm, headliness, bold);
  color: $colorAliceNight;
}

$arrowSize: 6px;

.filter__options {
  display: grid;
  grid-auto-flow: column;
  column-gap: $arrowSize * 1.5;
  justify-content: start;
  align-content: start;
  overflow-y: hidden;
  overflow-x: auto;
  scrollbar-width: 20%;

  @include scrollbar;
}

// option "component"

.filter__option {
  position: relative;
  display: grid;
  align-items: center;

  padding: 2px;

  border-radius: 50%;
  border: 2px solid transparent;
  background: transparent;
  transition: background-color, border-color .2s ease;

  &:not(:first-child):not(.filter__option--other)::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-top: $arrowSize - 1 solid transparent;
    border-bottom: $arrowSize - 1 solid transparent;
    border-left: $arrowSize solid $colorSecondaryLight;
    left: -($arrowSize * 1.5);
  }
}

.filter__option:hover {
  border-color: $colorAliceShadow;
  background-color: $colorAliceShadow;
}

.filter__option--positive,
.filter__option--positive:hover {
  border-color: $colorAliceNight;
  background-color: $colorAliceShadow;
}

.filter__option--negative,
.filter__option--negative:hover {
  border-color: $colorCrimson;
  background-color: $colorCrimsonDawn;
}

.filter__option__icon {
  height: 30px;
  width: 30px;
}

.filter__option__icon:hover {
  @include workflow-status-background-color;
  color: $colorWhite;
}

.filter__option__icon {
  @include workflow-status-background-color;
}
</style>
