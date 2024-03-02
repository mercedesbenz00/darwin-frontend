<template>
  <div
    class="filter"
    v-if="workflow"
  >
    <h3 class="filter__title">
      Active workflow
    </h3>
    <div
      class="filter__content"
      :class="{'filter__content--routing': !!$slots['workflow-routing']}"
    >
      <slot name="workflow-routing" />
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
            variant="inverted"
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
            variant="inverted"
            :type="stage.type"
            @click="toggleStage(stage)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import capitalize from 'lodash/capitalize'
import { Component, Vue, Prop } from 'vue-property-decorator'

import StatusButton from '@/components/WorkView/Common/StatusButton/V2/StatusButton.vue'
import {
  DatasetPayload,
  StageType,
  V2WorkflowPayload,
  V2WorkflowStagePayload
} from '@/store/types'
import { resolveNextTriToggleStatus, TriToggleStatus } from '@/utils'
import { getStagesPath, getOtherStages, dropConsensusInternalStages } from '@/utils/workflows'

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

  @Prop({ required: false, default: false, type: Boolean as () => boolean })
  showRouting!: boolean

  /** Happy path stages of the connected 2.0 workflow */
  get stages (): V2WorkflowStagePayload[] {
    const allStages = this.workflow.stages
    const stagesPath = dropConsensusInternalStages(getStagesPath(allStages))
    // make sure the complete stage is showed last, as even if it make
    // sense we calculate that by distance within the array, it might
    // be a confusing UX for users
    return [
      ...stagesPath.filter((s: V2WorkflowStagePayload) => s.type !== StageType.Complete),
      ...stagesPath.filter((s: V2WorkflowStagePayload) => s.type === StageType.Complete)
    ]
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
  @include col;
}

.filter__title {
  @include typography(md-1, inter, 500);
  color: $colorContentSecondary;
  padding: 2px 0;
}

.filter__content {
  @include col;
  width: fit-content;
  padding: 4px;
  border-radius: 100px;
  background-color: $colorSurfaceDarken;

  &--routing {
    display: flex;
    width: 100%;
    padding: 4px 8px;
    border-radius: 10px;
  }
}
.filter__options {
  display: grid;
  grid-auto-flow: column;
  column-gap: 2px;
  justify-content: start;
  align-content: start;
  overflow-y: hidden;
  overflow-x: auto;
  width: fit-content;
  max-width: 100%;
  @include scrollbarV2('horizontal');
}

// option "component"

.filter__option {
  position: relative;
  display: grid;
  align-items: center;

  border-radius: 50%;
  border: 2px solid transparent;
  background: transparent;
  transition: background-color, border-color .2s ease;
}

.filter__option:hover {
  border-color: $colorAliceShadow;
  background-color: $colorAliceShadow;
}

.filter__option--positive,
.filter__option--positive:hover {
  border-color: $colorInteractivePrimaryHover;
  background-color: $colorInteractivePrimaryHover;
}

.filter__option--negative,
.filter__option--negative:hover {
  border-color: $colorInteractiveNegativeHover;
  background-color: $colorInteractiveNegativeHover;
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
