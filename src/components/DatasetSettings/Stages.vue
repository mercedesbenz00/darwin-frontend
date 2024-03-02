<template>
  <div class="stages">
    <animating-draggable
      class="stages__draggable"
      handle="[data-movable]"
      :list="nonCompleteStageTemplates"
      @change="onDragChange"
    >
      <div
        v-for="(group, index) of nonCompleteStageTemplates"
        :key="`${group[0].stage_number}-${group[0].id}`"
        class="stages__stage"
      >
        <annotate-stage
          v-if="group[0].type === STAGE_TYPE.Annotate && (group[0].metadata.parallel || 1) <= 1"
          :actors="actors"
          :deletable="nonCompleteStageTemplates.length > 1"
          :stage="group[0]"
          :has-sampling="index < (nonCompleteStageTemplates.length - 1)"
          @change="onStageUpdate"
          @delete="onStageDelete(group)"
        />
        <blind-stage
          v-if="group[0].type === STAGE_TYPE.Annotate && group[0].metadata.parallel > 1"
          :actors="actors"
          :deletable="nonCompleteStageTemplates.length > 3"
          :stages="group"
          :has-sampling="index < (nonCompleteStageTemplates.length - 1)"
          @change="onStageUpdate"
          @delete="onStageDelete(group)"
        />
        <review-stage
          v-if="group[0].type === STAGE_TYPE.Review"
          :actors="actors"
          :deletable="nonCompleteStageTemplates.length > 1"
          :stage="group[0]"
          :has-sampling="index < (nonCompleteStageTemplates.length - 1)"
          @change="onStageUpdate"
          @delete="onStageDelete(group)"
        />
        <model-stage
          v-else-if="group[0].type === STAGE_TYPE.Model"
          :dataset="dataset"
          :deletable="nonCompleteStageTemplates.length > 1"
          :stage="group[0]"
          @change="onStageUpdate"
          @delete="onStageDelete(group)"
        />
        <code-stage
          v-else-if="group[0].type === STAGE_TYPE.Code"
          :deletable="nonCompleteStageTemplates.length > 1"
          :stage="group[0]"
          @change="onStageUpdate"
          @delete="onStageDelete(group)"
        />
        <stage-spacer>
          <chevron-right-icon />
        </stage-spacer>
      </div>
    </animating-draggable>

    <new-stage
      :template="template"
      @create="type => $emit('create', type)"
    />
    <workflow-stage-complete v-if="completeStageTemplate" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { ChangeEvent } from 'vuedraggable'
import { Getter } from 'vuex-class'

import AnimatingDraggable from '@/components/Common/AnimatingDraggable.vue'
import ModelStage from '@/components/DatasetSettings/ModelStage/ModelStage.vue'
import AnnotateStage from '@/components/DatasetSettings/Stage/AnnotateStage.vue'
import BlindStage from '@/components/DatasetSettings/Stage/BlindStage.vue'
import CodeStage from '@/components/DatasetSettings/Stage/CodeStage.vue'
import NewStage from '@/components/DatasetSettings/Stage/NewStage.vue'
import ReviewStage from '@/components/DatasetSettings/Stage/ReviewStage.vue'
import WorkflowStageComplete from '@/components/DatasetSettings/WorkflowStageComplete.vue'
import ChevronRightIcon from '@/components/DatasetSettings/assets/chevron-right.svg?inline'
import {
  DatasetPayload,
  WorkflowStageTemplatePayload,
  WorkflowTemplatePayload,
  StageType,
  MembershipPayload,
  MembershipScore
} from '@/store/types'

import StageSpacer from './Stage/StageSpacer.vue'
import { groupStages, StageActor } from './utils'

@Component({
  name: 'stages',
  components: {
    AnimatingDraggable,
    AnnotateStage,
    BlindStage,
    ChevronRightIcon,
    CodeStage,
    NewStage,
    ModelStage,
    ReviewStage,
    StageSpacer,
    WorkflowStageComplete
  }
})
export default class Stages extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  @Prop({ required: true })
  template!: WorkflowTemplatePayload

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  memberships!: MembershipPayload[]

  @Getter('getScoreInCurrentTeam', { namespace: 'team' })
  getScoreInCurrentTeam!: (membershipId: number) => MembershipScore | null

  @Getter('getScoreInDataset', { namespace: 'team' })
  getScoreInDataset!: (membershipId: number, datasetId: number) => MembershipScore | null

  get actors (): StageActor[] {
    const { dataset, memberships } = this
    return memberships.map(member => ({
      member,
      scoreInDataset: this.getScoreInDataset(member.id, dataset.id),
      scoreInTeam: this.getScoreInCurrentTeam(member.id)
    }))
  }

  readonly STAGE_TYPE = StageType

  /**
   * Due to a blind stage always being a group of annotate, test, review, we
   * organize all the stages in the workflow as groups, where the other groups
   * only contain a single element.
   *
   * That way the template can operate on groups, so for example, when a blind
   * anotate stage is deleted, we trigger deletion of the entire group easily.
   */
  get nonCompleteStageTemplates (): WorkflowStageTemplatePayload[][] {
    return groupStages(this.template.workflow_stage_templates)
  }

  get completeStageTemplate (): WorkflowStageTemplatePayload | undefined {
    return this.template.workflow_stage_templates.find(stage => stage.type === 'complete')
  }

  onStageUpdate (stage: WorkflowStageTemplatePayload): void {
    this.$emit('change', stage)
  }

  onStageDelete (stages: WorkflowStageTemplatePayload[]): void {
    this.$emit('delete', stages)
  }

  onDragChange (event: ChangeEvent<HTMLLIElement>): void {
    if (!event.moved) { return }
    const { oldIndex, newIndex } = event.moved
    this.$emit('swap', { oldIndex, newIndex })
  }
}
</script>

<style lang="scss" scoped>
.stages {
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  column-gap: 4px;
  height: 100%;
}

.stages__draggable {
  margin: 0;
  padding: 0;

  :deep(>) span {
    display: grid;
    grid-auto-flow: column;
    column-gap: 4px;
  }

.stages__stage {
  display: grid;
  grid-auto-flow: column;
  column-gap: 4px;
}}
</style>
