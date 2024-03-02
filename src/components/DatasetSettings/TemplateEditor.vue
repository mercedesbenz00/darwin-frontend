<template>
  <div class="template">
    <div class="template__header">
      <div class="template__header__main">
        <div class="template__header__title">
          Define an Annotation Flow
        </div>
        <div class="template__header__description">
          The steps each image will go through when being annotated.
          The same annotator or reviewer will not be assigned an image twice
          unless no one else is available.
        </div>
      </div>

      <slot name="header-other" />
    </div>

    <div
      v-loading="loading"
      class="template__stage-templates"
    >
      <stages
        v-if="editingWorkflowTemplate"
        :dataset="dataset"
        :template="editingWorkflowTemplate"
        @create="createStageTemplate"
        @change="updateStageTemplate"
        @swap="swapStageTemplates"
        @delete="maybeDeleteStageTemplates"
      />
    </div>

    <delete-confirmation-dialog
      ref="deleteConfirmationDialog"
      :name="deleteDialogName"
      title="Delete this Stage?"
      detail="Workflows that are currently in progress will continue using this stage."
      button-text="DELETE"
      @confirmed="deleteStageTemplates"
    />

    <running-session-loader v-if="shouldLoadRunningSessions" />
  </div>
</template>

<script lang="ts">
import { cloneDeep, difference } from 'lodash'
import isEqual from 'lodash/isEqual'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V1'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { createWorkflowTemplate } from '@/store/modules/dataset/actions/createWorkflowTemplate'
import {
  updateWorkflowStageTemplate
} from '@/store/modules/dataset/actions/updateWorkflowStageTemplate'
import {
  DatasetPayload,
  LoadingStatus,
  StageType,
  StoreActionPayload,
  WorkflowStageTemplatePayload,
  WorkflowTemplatePayload,
  StoreActionResponse
} from '@/store/types'

import RunningSessionLoader from './RunningSessionLoader'
import Stages from './Stages.vue'
import {
  buildNewStage,
  DEFAULT_METADATA,
  getDefaultStageTemplateName,
  isBlindAnnotateStage,
  isNormalAnnotateStage
} from './utils'

type SaveResponse =
  StoreActionResponse<typeof createWorkflowTemplate>
  | StoreActionResponse<typeof updateWorkflowStageTemplate>

const sortByStageNumber = (stageTemplates: WorkflowStageTemplatePayload[]): void => {
  stageTemplates.sort((a, b) => {
    if (a.stage_number < b.stage_number) { return -1 }
    if (a.stage_number > b.stage_number) { return 1 }
    return 0
  })
}

const buildStageTemplate = (
  templateId: number,
  stageNumber: number,
  type: Exclude<
    StageType, StageType.Dataset | StageType.Discard | StageType.ConsensusEntrypoint |
    StageType.ConsensusTest | StageType.Logic
  >,
  metadata: Partial<WorkflowStageTemplatePayload['metadata']> = {}
): WorkflowStageTemplatePayload => ({
  id: -1,
  name: getDefaultStageTemplateName(type),
  metadata: {
    ...DEFAULT_METADATA[type](),
    ...metadata
  },
  stage_number: stageNumber,
  type,
  workflow_stage_template_assignees: [],
  workflow_template_id: templateId
} as WorkflowStageTemplatePayload)

const buildStageTemplates = (
  templateId: number,
  atStageNumber: number,
  type: Exclude<
    StageType, StageType.Dataset | StageType.Discard | StageType.ConsensusEntrypoint |
    StageType.ConsensusTest | StageType.Logic
  >
): WorkflowStageTemplatePayload[] => {
  if (type === StageType.Test) {
    return [
      buildStageTemplate(templateId, atStageNumber, StageType.Annotate, { parallel: 2 }),
      buildStageTemplate(templateId, atStageNumber + 1, StageType.Test),
      buildStageTemplate(templateId, atStageNumber + 2, StageType.Review)
    ]
  }

  return [
    buildStageTemplate(templateId, atStageNumber, type)
  ]
}

@Component({
  name: 'template-editor',
  components: {
    DeleteConfirmationDialog,
    InputField,
    RunningSessionLoader,
    Stages
  }
})
export default class TemplateEditor extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  loadingStatus: LoadingStatus = LoadingStatus.Unloaded
  editingWorkflowTemplate: WorkflowTemplatePayload | null = null
  isCreatingNewWorkflowTemplate: boolean = false

  get loading (): boolean {
    return this.loadingStatus !== LoadingStatus.Loaded
  }

  @Getter('defaultWorkflowTemplate', { namespace: 'dataset' })
  getDefaultWorkflowTemplate!: (dataset: DatasetPayload) => WorkflowTemplatePayload | undefined

  get defaultWorkflowTemplate (): WorkflowTemplatePayload | undefined {
    return this.getDefaultWorkflowTemplate(this.dataset)
  }

  /** Indicates if app should fetch a list of accessible running sessions */
  get shouldLoadRunningSessions (): boolean {
    const { defaultWorkflowTemplate, editingWorkflowTemplate } = this
    const stageTemplates = editingWorkflowTemplate
      ? editingWorkflowTemplate.workflow_stage_templates
      : defaultWorkflowTemplate ? defaultWorkflowTemplate.workflow_stage_templates : []

    return stageTemplates.some(t => t.type === StageType.Model)
  }

  @Watch('defaultWorkflowTemplate', { immediate: true })
  onDatasetWorkflowTemplateChange (): void {
    if (this.loadingStatus !== LoadingStatus.Loaded) { return }
    this.initEditingWorkflowTemplate()
  }

  async mounted (): Promise<void> {
    this.loadingStatus = LoadingStatus.Loading

    if (this.dataset.version === 1) {
      await this.$store.dispatch('dataset/loadWorkflowTemplate', {
        id: this.dataset.default_workflow_template_id
      })

      await this.$store.dispatch('dataset/loadWorkflowTemplates', this.dataset)
    }

    this.loadingStatus = LoadingStatus.Loaded
    this.initEditingWorkflowTemplate()

    await this.$store.dispatch('team/getMembershipScores', { datasetId: this.dataset.id })
  }

  initEditingWorkflowTemplate (): void {
    if (!this.defaultWorkflowTemplate) {
      throw new Error(`Cannot locate the workflow templates for dataset ${this.dataset.id}`)
    }

    const editingWorkflowTemplate = cloneDeep(this.defaultWorkflowTemplate)
    sortByStageNumber(editingWorkflowTemplate.workflow_stage_templates)
    this.editingWorkflowTemplate = editingWorkflowTemplate
  }

  createStageTemplate (
    type: Exclude<StageType,
    StageType.Dataset | StageType.Discard | StageType.ConsensusEntrypoint |
    StageType.ConsensusTest | StageType.Logic>
  ): void {
    const { editingWorkflowTemplate } = this
    if (!editingWorkflowTemplate) { return }

    const { workflow_stage_templates: oldTemplates } = editingWorkflowTemplate

    const nonCompleteStages = oldTemplates.filter(t => t.type !== StageType.Complete)
    const completeStages = oldTemplates.filter(t => t.type === StageType.Complete)
    const atStageNumber = nonCompleteStages.length

    const newStages = buildStageTemplates(editingWorkflowTemplate.id, atStageNumber, type)

    editingWorkflowTemplate.workflow_stage_templates = [
      ...nonCompleteStages,
      ...newStages,
      ...completeStages
    ]

    this.updateStageNumbers()

    this.isCreatingNewWorkflowTemplate = true
    this.$emit('change')
  }

  updateStageTemplate (stageTemplate: WorkflowStageTemplatePayload): void {
    const { editingWorkflowTemplate } = this
    if (!editingWorkflowTemplate) { return }

    const stageTemplates = [...editingWorkflowTemplate.workflow_stage_templates]

    const idx = stageTemplates.findIndex(s => s.stage_number === stageTemplate.stage_number)

    if (idx < 0) { return }

    const oldTemplate = stageTemplates[idx]

    const newIsBlind = isBlindAnnotateStage(stageTemplate)
    const oldIsNormal = isNormalAnnotateStage(oldTemplate)

    stageTemplates[idx] = stageTemplate

    // if we're switching from non-blind to blind annotate stage,
    // we need to introduce the mandatory test and review stages that follow it
    // if we switch the opposite way, we need to remove those
    if (oldIsNormal && newIsBlind) {
      stageTemplates.splice(idx + 1, 0,
        buildNewStage(editingWorkflowTemplate, StageType.Test),
        buildNewStage(editingWorkflowTemplate, StageType.Review)
      )
    } else if (stageTemplate.type === StageType.Annotate && !oldIsNormal && !newIsBlind) {
      stageTemplates.splice(idx + 1, 2)
    }

    // if there was a conversion from blind to non-blind annotate stage or vice
    // versa, the stages in the workflow will have changed, so we need to
    // trigger creation of new workflow and update stage numbers

    const hadConversion =
      stageTemplate.type === StageType.Annotate &&
        ((oldIsNormal && newIsBlind) || (!oldIsNormal && !newIsBlind))

    editingWorkflowTemplate.workflow_stage_templates = stageTemplates

    // we can't change the number of parallel stages for an existing workflow
    // backend will block it, because it would affect assigned users

    // instead, we trigger creation of a new worklof if that's what's being done

    const changedParallelCount =
      'parallel' in stageTemplate.metadata &&
      'parallel' in oldTemplate.metadata &&
      stageTemplate.metadata.parallel !== oldTemplate.metadata.parallel

    if (hadConversion || changedParallelCount) {
      this.isCreatingNewWorkflowTemplate = true
      this.updateStageNumbers()
    }

    this.$emit('change')
  }

  stageTemplatesToDelete: WorkflowStageTemplatePayload[] | null = null

  readonly deleteDialogName: string = 'stage-delete-confirmation'

  maybeDeleteStageTemplates (stageTemplates: WorkflowStageTemplatePayload[]): void {
    this.stageTemplatesToDelete = stageTemplates

    // if the template is unsaved, remove it without confirmation dialog
    if (stageTemplates.every(t => t.id === -1)) {
      this.deleteStageTemplates()
      return
    }

    this.$modal.show(this.deleteDialogName)
  }

  deleteStageTemplates (): void {
    const { editingWorkflowTemplate, stageTemplatesToDelete } = this
    if (!editingWorkflowTemplate) { return }
    if (!stageTemplatesToDelete) { return }

    const numbersToDelete = stageTemplatesToDelete.map(t => t.stage_number)

    editingWorkflowTemplate.workflow_stage_templates =
      editingWorkflowTemplate.workflow_stage_templates.filter(
        t => !numbersToDelete.includes(t.stage_number)
      )

    this.updateStageNumbers()

    this.$modal.hide(this.deleteDialogName)
    this.updateIsCreatingTemplateOrNot()
    this.$emit('change')
  }

  swapStageTemplates (params: { oldIndex: number, newIndex: number }): void {
    const { editingWorkflowTemplate } = this
    if (!editingWorkflowTemplate) { return }

    const stageTemplates = [...editingWorkflowTemplate.workflow_stage_templates]

    const { oldIndex, newIndex } = params
    const moveAmount = newIndex - oldIndex

    const firstMovedStage = stageTemplates[oldIndex]
    const movedStages = isBlindAnnotateStage(firstMovedStage)
      ? [firstMovedStage, stageTemplates[oldIndex + 1], stageTemplates[oldIndex + 2]]
      : [firstMovedStage]

    stageTemplates.splice(oldIndex, movedStages.length)
    stageTemplates.splice(oldIndex + moveAmount, 0, ...movedStages)

    editingWorkflowTemplate.workflow_stage_templates = stageTemplates

    this.updateStageNumbers()
    this.updateIsCreatingTemplateOrNot()
    this.$emit('change')
  }

  updateStageNumbers (): void {
    const { editingWorkflowTemplate } = this

    if (!editingWorkflowTemplate) { return }

    const { workflow_stage_templates: stageTemplates } = editingWorkflowTemplate

    stageTemplates.forEach((stageTemplate, index) => {
      stageTemplate.stage_number = index + 1
    })

    sortByStageNumber(editingWorkflowTemplate.workflow_stage_templates)
  }

  /**
   * Update the flag if the user is creating or new template or just
   * updating the existing one
   */
  updateIsCreatingTemplateOrNot (): void {
    if (!this.editingWorkflowTemplate || !this.defaultWorkflowTemplate) { return }
    const { workflow_stage_templates: stageTemplates } = this.editingWorkflowTemplate

    const defaultStageTemplates = [...this.defaultWorkflowTemplate.workflow_stage_templates]
    sortByStageNumber(defaultStageTemplates)

    const isCreatingNewWorkflowTemplate =
      stageTemplates.some(stageTemplate => stageTemplate.id === -1) ||
      stageTemplates.length !== defaultStageTemplates.length

    this.isCreatingNewWorkflowTemplate = isCreatingNewWorkflowTemplate
    if (isCreatingNewWorkflowTemplate) { return }

    // compare the order of the stages
    for (let i = 0; i < stageTemplates.length; i++) {
      if (
        stageTemplates[i].id !== defaultStageTemplates[i].id ||
        stageTemplates[i].type !== defaultStageTemplates[i].type
      ) {
        this.isCreatingNewWorkflowTemplate = true
        break
      }
    }
  }

  async createNewWorkflowTemplate (): Promise<StoreActionResponse<typeof createWorkflowTemplate>> {
    if (!this.editingWorkflowTemplate || !this.defaultWorkflowTemplate) {
      return Promise.resolve({ data: null })
    }

    const { name, ...createParams } = this.editingWorkflowTemplate
    const { data, error } = await this.$store.dispatch(
      'dataset/createWorkflowTemplate',
      createParams
    )

    if (error) {
      return { error }
    }

    return this.$store.dispatch(
      'dataset/setDefaultWorkflowTemplate',
      data as WorkflowTemplatePayload
    )
  }

  async updateExistingWorkflowTemplate ():
  Promise<StoreActionResponse<typeof updateWorkflowStageTemplate> | { data: null }> {
    if (!this.editingWorkflowTemplate || !this.defaultWorkflowTemplate) {
      return Promise.resolve({ data: null })
    }

    const { defaultWorkflowTemplate, editingWorkflowTemplate } = this

    const dirtyStages = editingWorkflowTemplate.workflow_stage_templates.filter(stageTemplate => {
      const oldStage =
        defaultWorkflowTemplate.workflow_stage_templates.find(s => s.id === stageTemplate.id)

      if (!oldStage) { return true }

      if (oldStage.name !== stageTemplate.name) { return true }

      const { metadata: newMetadata } = stageTemplate
      const { metadata: oldMetadata } = oldStage
      if (!isEqual(newMetadata, oldMetadata)) { return true }

      const { workflow_stage_template_assignees: newAssignees } = stageTemplate
      const { workflow_stage_template_assignees: oldAssignees } = oldStage
      return difference(newAssignees, oldAssignees).length > 0 ||
        difference(oldAssignees, newAssignees).length > 0
    })

    if (dirtyStages.length === 0) { return { data: null } }

    const responses = await Promise.all(
      dirtyStages.map(stageTemplate => {
        const params: StoreActionPayload<typeof updateWorkflowStageTemplate> = {
          assignees: stageTemplate.workflow_stage_template_assignees.map(t => ({
            id: t.assignee_id,
            samplingRate: t.sampling_rate
          })),
          name: stageTemplate.name,
          metadata: stageTemplate.metadata,
          stageId: stageTemplate.id
        }

        return this.$store.dispatch('dataset/updateWorkflowStageTemplate', params)
      })
    )
    const error = responses.filter(r => !!r.error).map(r => r.error)
    if (error.length > 0) {
      return { error: error[0] }
    } else {
      return { data: null }
    }
  }

  public async saveWorkflowTemplate (): Promise<SaveResponse> {
    if (this.isCreatingNewWorkflowTemplate) {
      const response = await this.createNewWorkflowTemplate()
      if (!('error' in response)) {
        this.isCreatingNewWorkflowTemplate = false
      }
      return response
    } else {
      const response = await this.updateExistingWorkflowTemplate()
      return response
    }
  }
}
</script>

<style lang="scss" scoped>
.template {
  width: 100%;
  height: 100%;
  @include col;
  gap: 20px;
}

.template__header {
  width: 100%;
  @include row;
}

.template__header__main {
  flex: 1;
  @include col;
}

.template__header__title {
  @include typography(lg-1, default, bold);
  color: $colorSecondaryDark1;
  margin-bottom: 10px;
}

.template__header__description {
  @include typography(lg);
  color: $colorSecondaryDark1;
}

.template__stage-templates {
  @include col;
  overflow-x: auto;
  padding-bottom: 20px;
}
</style>
