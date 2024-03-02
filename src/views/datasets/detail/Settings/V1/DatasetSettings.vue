<template>
  <dataset-detail-layout
    class="dataset-settings"
    title-editable
    :dataset="dataset"
    @change-title="name = $event"
  >
    <template #header-actions>
      <secondary-button
        class="dataset-settings__save"
        :disabled="!isDirty"
        @click="saveChanges"
      >
        Save changes
      </secondary-button>
    </template>
    <template #content>
      <div class="dataset-settings__main--wrapper">
        <div class="dataset-settings__main froala-sticky-container">
          <div class="dataset-settings__panel">
            <citation-info
              v-if="dataset.public"
              :dataset="dataset"
            />
            <div class="dataset-settings__instructions">
              <p class="dataset-settings__panel-title">
                Annotation Instructions
              </p>
              <p
                class="dataset-settings__panel-description"
              >
                These instructions will be visible during annotation, and displayed to any
                newcomer to the dataset.
              </p>
              <div
                v-if="froalaLoaded"
                ref="editorCover"
                class="editor"
              >
                <froala
                  ref="editor"
                  v-model="instructions"
                  tag="textarea"
                  :config="wysiwygConfig"
                  style="height: 100%"
                />
              </div>
            </div>
            <workforce-managers
              :dataset="dataset"
              @change="params => workforceManagersParams = params"
            />
            <template-editor
              ref="templateEditor"
              class="dataset-settings__templates"
              :dataset="dataset"
              @change="workflowTemplateDirty = true"
            />
          </div>
          <div class="dataset-settings__panel dataset-settings__task-settings">
            <workflow-work-size
              ref="workSize"
              v-model="workSize"
              class="dataset-settings__batch-size"
            />
            <workflow-work-priority v-model="workPrioritization" />
          </div>
          <div class="dataset-settings__panel dataset-settings__permissions">
            <div class="dataset-settings__permission">
              <check-box
                id="annotatorTags"
                v-model="annotatorsCanCreateTags"
                name="annotatorTags"
                label="Allow workers to create new tag classes and attributes"
                size="small"
              />
              <info>
                Annotators can type in any new tag or attribute and press
                'enter' to create it. Other users may re-use it.
              </info>
            </div>
            <div class="dataset-settings__permission">
              <check-box
                id="annotatorWorkflows"
                v-model="annotatorsCanInstantiateWorkflows"
                name="annotatorWorkflows"
                label="Allow workers to work indefinitely by self-assigning batches of New images"
                size="small"
              />
            </div>
            <div class="dataset-settings__permission">
              <check-box
                id="doubleAssignment"
                v-model="anyoneCanDoubleAssign"
                name="doubleAssignment"
                label="Allow the same worker to do multiple steps in one workflow"
                size="small"
              />
              <info>When disabled workers cannot both annotate and review the same image.</info>
            </div>
            <div class="dataset-settings__permission">
              <check-box
                id="pdfFitPage"
                v-model="pdfFitPage"
                name="pdfFitPage"
                label="Force processed PDFs to fit standard page format"
                size="small"
              />
              <info>
                When processing PDFs, this will auto-fit them to standard page format. Without this,
                they remain unchanged.
              </info>
            </div>
          </div>
          <div
            v-if="dataset"
            class="dataset-settings__panel dataset-settings__share"
          >
            <label>Open dataset for public read access</label>
            <dataset-sharer
              class="dataset-settings__sharer"
              :disabled="team.disable_dataset_sharing"
              :dataset="dataset"
              :team="team"
              @toggle-share="updateDatasetPublicState"
            />
          </div>
        </div>
      </div>

      <settings-save-confirm-dialog
        :loading="saving"
        @discard="onModalDiscard"
        @save="onModalSave"
      />
    </template>
  </dataset-detail-layout>
</template>

<script lang="ts">
import isEmpty from 'validator/lib/isEmpty'
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { State } from 'vuex-class'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import Info from '@/components/Common/Info.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import DatasetDetailLayout from '@/components/Dataset/DatasetDetail/DatasetDetailLayout.vue'
import DatasetSharer from '@/components/Dataset/DatasetSharer.vue'
import WorkflowWorkPriority from '@/components/Dataset/WorkflowWorkPriority.vue'
import WorkflowWorkSize from '@/components/Dataset/WorkflowWorkSize.vue'
import CitationInfo from '@/components/DatasetManagement/Common/CitationInfo/CitationInfo.vue'
import SettingsSaveConfirmDialog from '@/components/DatasetSettings/SettingsSaveConfirmDialog.vue'
import TemplateEditor from '@/components/DatasetSettings/TemplateEditor.vue'
import WorkforceManagers from '@/components/DatasetSettings/WorkforceManagers.vue'
import importFroala from '@/plugins/froala-importer'
import updateDataset from '@/store/modules/dataset/actions/updateDataset'
import {
  DatasetPayload,
  ValidationError,
  TeamPayload,
  StoreActionPayload
} from '@/store/types'
import { resolveLocationFromRoute } from '@/utils/router'
import {
  getEditorConfig,
  uploadFiles,
  FroalaEditor
} from '@/views/datasets/utils/instructionsEditor'

type UpdateParams = StoreActionPayload<typeof updateDataset>

@Component({
  name: 'dataset-settings',
  components: {
    CheckBox,
    CitationInfo,
    DatasetDetailLayout,
    DatasetSharer,
    Info,
    InputField,
    SettingsSaveConfirmDialog,
    TemplateEditor,
    WorkflowWorkPriority,
    WorkflowWorkSize,
    WorkforceManagers
  }
})
export default class DatasetSettings extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @State(state => state.team.currentTeam)
  team!: TeamPayload

  error: {} = {}
  name: string = ''
  workSize: number = 30
  workPrioritization: string = 'inserted_at:asc'
  instructions: string | undefined = ''
  annotatorsCanCreateTags: boolean = false
  annotatorsCanInstantiateWorkflows: boolean = false
  anyoneCanDoubleAssign: boolean = false
  workflowTemplateDirty: boolean = false
  pdfFitPage: boolean = true
  saving: boolean = false

  workforceManagersParams: UpdateParams['params']['workforceManagers'] | null = null

  froalaLoaded: boolean = false
  froalaStickyContainer: string = '.froala-sticky-container'
  wysiwygConfig: Object = getEditorConfig(this)

  $refs!: {
    workSize: WorkflowWorkSize
    templateEditor: TemplateEditor
  }

  @Watch('dataset', { immediate: true })
  onDatasetLoaded (dataset: DatasetPayload | undefined): void {
    if (!dataset) { return }

    this.instructions = dataset.instructions
    this.annotatorsCanCreateTags = dataset.annotators_can_create_tags
    this.annotatorsCanInstantiateWorkflows = dataset.annotators_can_instantiate_workflows
    this.anyoneCanDoubleAssign = dataset.anyone_can_double_assign
    this.name = dataset.name
    this.workSize = dataset.work_size || 30
    this.workPrioritization = dataset.work_prioritization || 'inserted_at:asc'
    this.pdfFitPage = dataset.pdf_fit_page
  }

  created (): void {
    if (!this.$options.components!.froala) {
      importFroala().then(() => { this.froalaLoaded = true })
    } else {
      this.froalaLoaded = true
    }

    window.addEventListener('beforeunload', this.confirmSaveBeforeClose)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('beforeunload', this.confirmSaveBeforeClose)
    })
  }

  mounted (): void {
    if (!this.$can('view_full_datasets')) { this.$router.replace('/') }
  }

  confirmSaveBeforeClose (event: BeforeUnloadEvent): void | string {
    if (this.isDirty) {
      const warning = 'Save changes before leaving?'
      event.returnValue = warning
      return warning
    }
  }

  updateErrors (validationErrors: ValidationError): void {
    if (validationErrors.name) {
      this.$store.dispatch('toast/warning', { content: validationErrors.name })
    }
    if (this.$refs.workSize) {
      this.$refs.workSize.setError(validationErrors.workSize as string)
    }
  }

  validateForm (): ValidationError {
    const validationErrors: ValidationError = {}

    if (isEmpty(this.name)) {
      validationErrors.name = 'Dataset name cannot be empty!'
    }

    if (isNaN(this.workSize)) {
      validationErrors.workSize = 'Task size should be number.'
    } else if (this.workSize <= 0 || this.workSize > 100) {
      validationErrors.workSize = 'Task size should be a number between 1 and 100.'
    }

    return validationErrors
  }

  previousRouteTo: Route | null = null

  beforeRouteLeave (to: Route, from: Route, next: Function): void {
    if (!this.isDirty) {
      next()
      return
    }
    this.previousRouteTo = to
    this.$modal.show('settings-save-confirm')
  }

  onModalDiscard (): void {
    this.reset()
    this.$modal.hide('settings-save-confirm')
    if (!this.previousRouteTo) { return }
    this.$router.push(resolveLocationFromRoute(this.previousRouteTo))
  }

  async onModalSave (): Promise<void> {
    const saved = await this.saveChanges()
    this.$modal.hide('settings-save-confirm')
    if (!saved) { return }
    if (!this.previousRouteTo) { return }
    this.$router.push(resolveLocationFromRoute(this.previousRouteTo))
  }

  async saveChanges (): Promise<boolean> {
    this.saving = true
    const saved = await this.submitChanges()
    this.saving = false

    return saved
  }

  async submitChanges (): Promise<boolean> {
    const clientValidationErrors = this.validateForm()

    if (Object.keys(clientValidationErrors).length > 0) {
      this.updateErrors(clientValidationErrors)
      this.$ga.event('update_dataset', 'save_changes', 'failure_form_invalid')
      return false
    }

    const templateResponse = await this.$refs.templateEditor.saveWorkflowTemplate()

    if ('error' in templateResponse) {
      const { error } = templateResponse
      // this will be a parsed error response, or a constructer error,
      // not an axios response so no status to report
      const status = undefined
      this.$ga.event(
        'update_dataset',
        'save_changes',
        'failure_request_failed',
        status
      )
      this.$store.dispatch('toast/warning', { content: error.message })
      return false
    }

    const { dataset } = this

    const params: UpdateParams['params'] = {
      name: this.name,
      workSize: this.workSize,
      workPrioritization: this.workPrioritization,
      instructions: this.instructions,
      annotatorsCanCreateTags: this.annotatorsCanCreateTags,
      annotatorsCanInstantiateWorkflows: this.annotatorsCanInstantiateWorkflows,
      anyoneCanDoubleAssign: this.anyoneCanDoubleAssign,
      workforceManagers: this.workforceManagersParams || undefined,
      pdfFitPage: this.pdfFitPage
    }

    const payload: UpdateParams = { dataset, params }

    const { error } = await this.$store.dispatch('dataset/updateDataset', payload)

    if (error) {
      this.$ga.event(
        'update_dataset',
        'save_changes',
        'failure_request_failed',
        error.response && error.response.status
      )
      this.updateErrors(error)

      return false
    }

    this.reset()

    this.$store.dispatch('toast/notify', { content: 'Settings have been updated' })
    this.$ga.event('update_dataset', 'save_changes', 'success')
    return true
  }

  /**
   * Unsets all edit fields, so the "form" is in a clean state
   * and the save button is disabled again.
   *
   * Note that some of this is handled by the dataset "reloading", while
   * some is handled by child components.
   */
  reset (): void {
    const { dataset } = this
    this.instructions = dataset.instructions
    this.annotatorsCanCreateTags = dataset.annotators_can_create_tags
    this.annotatorsCanInstantiateWorkflows = dataset.annotators_can_instantiate_workflows
    this.anyoneCanDoubleAssign = dataset.anyone_can_double_assign
    this.name = dataset.name
    this.workSize = dataset.work_size || 30
    this.workPrioritization = dataset.work_prioritization || 'inserted_at:asc'
    this.workflowTemplateDirty = false
    this.workforceManagersParams = null
    this.pdfFitPage = dataset.pdf_fit_page
  }

  uploadFiles (files: File[], editor: FroalaEditor): void | Promise<void> {
    if (!this.dataset) { return }
    return uploadFiles(this, files, editor, {
      datasetId: this.dataset.id,
      gaCategory: 'update_dataset'
    })
  }

  updateDatasetPublicState (): void {
    const { dataset } = this
    const payload: UpdateParams = {
      dataset,
      params: { public: !dataset.public }
    }
    this.$store.dispatch('dataset/updateDataset', payload)
  }

  get isDirty (): boolean {
    if (!this.dataset) { return false }

    return !!this.workforceManagersParams ||
      this.instructions !== this.dataset.instructions ||
      this.annotatorsCanCreateTags !== this.dataset.annotators_can_create_tags ||
      (
        this.annotatorsCanInstantiateWorkflows !==
        this.dataset.annotators_can_instantiate_workflows
      ) ||
      this.anyoneCanDoubleAssign !== this.dataset.anyone_can_double_assign ||
      this.name !== this.dataset.name ||
      this.pdfFitPage !== this.dataset.pdf_fit_page ||
      `${this.workSize}` !== `${this.dataset.work_size}` ||
      this.workPrioritization !== this.dataset.work_prioritization ||
      this.workflowTemplateDirty
  }
}
</script>

<style lang="scss" scoped>
.dataset-settings {
  background: $colorSecondaryLight2;
}

.dataset-settings__main--wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 5px;
}

.dataset-settings__main {
  @include col;
  height: 100%;
  overflow-y: auto;
  border-radius: 5px;
  padding: 20px 45px;

  & > *:not(:last-child) {
    margin-bottom: 20px;
  }
}

.dataset-settings__save {
  width: 100%;
  height: 100%;
}

.dataset-settings__panel {
  background: $colorSecondaryLight3;
  border-radius: 5px;
  padding: 40px 50px;

  display: grid;
  grid-auto-flow: row;
  row-gap: 20px;
}

.dataset-settings__panel-title {
  @include typography(lg-1, default, bold);
  color: $colorSecondaryDark1;
  margin-bottom: 10px;
}

.dataset-settings__panel-description {
  @include typography(lg);
  color: $colorSecondaryDark1;
  margin-bottom: 10px;
}

.dataset-settings__instructions {
  width: 100%;
  overflow: hidden;

  :deep(.custom-theme.fr-box) {
    width: 100%;
  }
}

.dataset-settings__templates {
  width: 100%;
  flex: 1;
  height: auto;
  overflow: hidden;
}

$panel-width: 600px;

.dataset-settings__task-settings {
  width: $panel-width;
  padding: 16px 20px;
}

.dataset-settings__batch-size {
  margin-bottom: 10px;
}

.dataset-settings__permissions {
  @include col;
  width: $panel-width;
  padding: 16px 20px;
}

.dataset-settings__permission {
  @include row;
  align-items: center;

  :deep(label) {
    width: auto;
  }
}

.dataset-settings__permission > *:not(:last-child) {
  margin-right: 15px;
}

.dataset-settings__permission:not(:last-child) {
  margin-bottom: 15px;
}

.dataset-settings__permission :deep(.check-box__label__text) {
  font-size: 14px !important;
  line-height: 18px !important;
  color: $colorSecondaryDark1;
}

.dataset-settings__share {
  @include row--distributed--center;
  width: $panel-width;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.dataset-settings__share label {
  @include typography(md-1);
  color: $colorSecondaryDark1;
}

.dataset-settings__sharer :deep(button) {
  width: 180px;
  height: 35px;
  text-transform: uppercase;
}

.dataset-settings .editor :deep(.fr-wrapper.show-placeholder) {
  background: $colorLineGrey;
}

.dataset-settings :deep(.svg-inline--fa) {
  margin: 0 !important;
}
</style>
