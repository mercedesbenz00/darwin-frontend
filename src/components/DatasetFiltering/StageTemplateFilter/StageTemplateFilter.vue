<template>
  <div class="filter">
    <h3 class="filter__title">
      Active workflow
    </h3>
    <div class="filter__options">
      <div
        v-for="template in stageTemplates"
        :key="template.id"
        v-tooltip="tooltip(template)"
        class="filter__option"
        :class="{
          'filter__option--positive': positiveStageTemplateIds.includes(template.id),
          'filter__option--negative': negativeStageTemplateIds.includes(template.id)
        }"
      >
        <status-button
          class="filter__option__icon"
          :type="template.type"
          @click="toggleStageTemplate(template.id)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import capitalize from 'lodash/capitalize'
import { Component, Vue, Prop } from 'vue-property-decorator'

import StatusButton from '@/components/WorkView/Common/StatusButton/V2/StatusButton.vue'
import { WorkflowTemplatePayload, WorkflowStageTemplatePayload } from '@/store/types'
import { resolveNextTriToggleStatus, TriToggleStatus } from '@/utils'

@Component({ name: 'stage-template-filter', components: { StatusButton } })
export default class StageTemplateFilter extends Vue {
  @Prop({ default: () => [], type: Array as () => WorkflowStageTemplatePayload['id'][] })
  positiveStageTemplateIds!: WorkflowStageTemplatePayload['id'][]

  @Prop({ default: () => [], type: Array as () => WorkflowStageTemplatePayload['id'][] })
  negativeStageTemplateIds!: WorkflowStageTemplatePayload['id'][]

  @Prop({ required: true, type: Object as () => WorkflowTemplatePayload })
  workflowTemplate!: WorkflowTemplatePayload

  get stageTemplates (): WorkflowStageTemplatePayload[] {
    return [...this.workflowTemplate.workflow_stage_templates]
      .sort((a, b) => a.stage_number - b.stage_number)
  }

  tooltip (template: WorkflowStageTemplatePayload): string {
    return template.name || capitalize(template.type)
  }

  getStatusByTemplateId (id: WorkflowStageTemplatePayload['id']): TriToggleStatus {
    if (this.positiveStageTemplateIds.includes(id)) { return 'positive' }
    if (this.negativeStageTemplateIds.includes(id)) { return 'negative' }
    return 'none'
  }

  toggleStageTemplate (id: WorkflowStageTemplatePayload['id']) {
    const currentStatus = this.getStatusByTemplateId(id)
    const nextStatus = resolveNextTriToggleStatus(currentStatus)

    const positiveStageTemplateIds = currentStatus === 'positive'
      ? this.positiveStageTemplateIds.filter(pid => pid !== id)
      : [...this.positiveStageTemplateIds]
    const negativeStageTemplateIds = currentStatus === 'negative'
      ? this.negativeStageTemplateIds.filter(pid => pid !== id)
      : [...this.negativeStageTemplateIds]

    if (nextStatus === 'positive') {
      positiveStageTemplateIds.push(id)
    } else if (nextStatus === 'negative') {
      negativeStageTemplateIds.push(id)
    }

    this.$emit('change', {
      positiveStageTemplateIds,
      negativeStageTemplateIds
    })
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

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-top: $arrowSize - 1 solid transparent;
    border-bottom: $arrowSize - 1 solid transparent;
    border-left: $arrowSize solid $colorSecondaryLight;
    right: -($arrowSize * 1.5);
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
  height: 32px;
  width: 32px;
}

.filter__option__icon:hover.status-button {

  @include workflow-status-background-color;
  color: $colorWhite;
}

.filter__option__icon.status-button {
  @include workflow-status-background-color;
  color: $colorWhite;
}

</style>
