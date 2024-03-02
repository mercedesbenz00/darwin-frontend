<template>
  <work-tracker :topic="topic" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import {
  AnnotateStagePayload,
  DatasetItemPayload,
  DatasetPayload,
  StageType,
  UserPayload,
  WorkflowStagePayload,
  WorkflowTemplatePayload,
  V2WorkflowStageInstancePayload,
  V2WorkflowStagePayload,
  V2DatasetItemPayload
} from '@/store/types'

import WorkTracker from './WorkTracker.vue'

const ACTIONS = [
  'workview/approveStage',
  'workview/archiveStage',
  'workview/rejectStage',
  'workview/cancelStageAutoComplete',
  'workview/createWorkflow',
  'workview/createStageAnnotation',
  'workview/createV2Annotation',
  'workview/updateStageAnnotation',
  'workview/updateV2Annotation',
  'workview/deleteStageAnnotation',
  'workview/deleteV2Annotation'
]

const UNTRACKED = [
  StageType.Code,
  StageType.Complete,
  StageType.Model,
  StageType.Test
]

const TRACKED = [StageType.Annotate, StageType.Review]

/**
 * Renders work time tracker, computing and providing a topic for it
 *
 * Intended to serve both annotator and regular team member.
 */
@Component({ name: 'workflow-tracker', components: { WorkTracker } })
export default class WorkflowTracker extends Vue {
  @State(state => state.workview.selectedDatasetItem)
  item!: DatasetItemPayload

  get v2Item (): V2DatasetItemPayload {
    return this.$store.getters['workview/v2SelectedDatasetItem']
  }

  @State(state => state.workview.dataset)
  dataset!: DatasetPayload

  @Getter('defaultWorkflowTemplate', { namespace: 'workview' })
  getDefaultWorkflowTemplate!: (dataset: DatasetPayload) => WorkflowTemplatePayload | null

  get template (): WorkflowTemplatePayload | null {
    if (!this.dataset) { return null }
    return this.getDefaultWorkflowTemplate(this.dataset)
  }

  /** Currently signed in user. */
  @State(state => state.user.profile)
  user!: UserPayload

  /**
   * The stage instance which the user currently has selected.
   *
   * This also gets auto-selected as the user selects different dataset items
   */
  @State(state => state.workview.selectedStageInstance)
  selectedStageInstance!: WorkflowStagePayload | null

  /**
   * [Workflows 2.0] The stage instance which the user currently has selected.
   *
   * This also gets auto-selected as the user selects different dataset items
   */
  @State(state => state.workview.v2SelectedStageInstance)
  v2SelectedStageInstance!: V2WorkflowStageInstancePayload | null

  /**
   * [Workflows 2.0] The stage which the user currently has selected.
   *
   * This also gets auto-selected as the user selects different dataset items
   */
  @State(state => state.workview.v2SelectedStage)
  v2SelectedStage!: V2WorkflowStagePayload | null

  @Getter('isStageInstanceCurrent', { namespace: 'workview' })
  isStageInstanceCurrent!: (instance: WorkflowStagePayload) => boolean

  get isVersion2 (): boolean {
    return this.$store.getters['dataset/isVersion2']
  }

  topicString (
    stage: string,
    type: string,
    payload:
      AnnotateStagePayload |
      DatasetItemPayload |
      V2WorkflowStageInstancePayload |
      V2WorkflowStagePayload |
      WorkflowStagePayload |
      V2DatasetItemPayload
  ): string {
    return `workview:${stage}:${type}:${payload.id}`
  }

  v2TopicString (
    stage: string,
    type: string,
    teamId: number,
    payload:
      AnnotateStagePayload |
      DatasetItemPayload |
      V2WorkflowStageInstancePayload |
      V2WorkflowStagePayload |
      WorkflowStagePayload |
      V2DatasetItemPayload
  ): string {
    return `workview_v2:${stage}:${type}:${teamId}:${payload.id}`
  }

  /**
   * Resolves and updates tracking topic depending on what the user is currently
   * viewing.
   *
   * Gets called when the user makes an item or stage selection.
   *
   * While the code itself doesn't make this clear, due to multiple moving parts,
   * the end goal is
   *
   * 1. If the user is viewing a past or future stage of any image (time travel),
   * there should be no time tracking and no topic
   *
   * 2. If the user is viewing the current stage of an image assigned to them,
   * time should be tracked to their own stage instance.
   *
   * 3. If the user is viewing the current stage of someone else's image,
   * time should be tracked to the selected instance. This should only happen if
   * the user is more than annotator.
   */
  get topic (): string | null {
    return this.isVersion2 ? this.topicV2 : this.topicV1
  }

  get topicV1 (): string | null {
    const { item, selectedStageInstance: stage, template } = this
    if (!item) { return null }
    if (!stage) {
      if (!template) { return this.topicString('annotate', 'item', item) }

      const stageTemplate = template.workflow_stage_templates.find(t => t.stage_number === 1)

      // COMPLETE means next action will restart workflow,
      // so that time is tracked as annotate
      if (!stageTemplate || stageTemplate.type === StageType.Complete) {
        return this.topicString('annotate', 'item', item)
      }

      if (UNTRACKED.includes(stageTemplate.type)) {
        return null
      }

      return this.topicString(stageTemplate.type, 'item', item)
    }

    if (stage.workflow_id !== item.current_workflow_id) { return null }

    if (UNTRACKED.includes(stage.type)) { return null }

    if (!this.isStageInstanceCurrent(stage)) { return null }

    return this.topicString(stage.type, 'stage', stage)
  }

  get topicV2 (): string | null {
    const { v2Item, v2SelectedStageInstance, v2SelectedStage } = this

    if (v2SelectedStageInstance && TRACKED.includes(v2SelectedStageInstance.stage?.type)) {
      return this.v2TopicString(
        v2SelectedStageInstance.stage.type,
        'stage_instance',
        this.dataset.team_id,
        v2SelectedStageInstance
      )
    }
    if (v2Item && v2SelectedStage && TRACKED.includes(v2SelectedStage.type)) {
      return this.v2TopicString(v2SelectedStage.type, 'item', this.dataset.team_id, v2Item)
    }
    return this.v2TopicString('annotate', 'item', this.dataset.team_id, v2Item)
  }

  mounted (): void {
    const unsubscribe = this.$store.subscribeAction((action) => {
      if (ACTIONS.includes(action.type)) {
        this.$store.dispatch('workviewTracker/reportActivity')
      }
    })

    this.$once('hook:beforeDestroy', unsubscribe)
  }
}

</script>
