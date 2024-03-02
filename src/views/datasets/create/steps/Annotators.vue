<template>
  <div class="dataset-create__box">
    <template-editor
      ref="templateEditor"
      class="dataset-create__annotators"
      :dataset="dataset"
    >
      <template #header-other>
        <div class="dataset-create__annotators__task-settings">
          <workflow-work-size
            v-model="workSize"
            class="dataset-create__annotators__work-size"
          />
          <workflow-work-priority v-model="workPrioritization" />
        </div>
      </template>
    </template-editor>

    <div class="dataset-create__actions">
      <positive-button @click="onContinue">
        Save & Start Annotating
      </positive-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import Info from '@/components/Common/Info.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import WorkflowWorkPriority from '@/components/Dataset/WorkflowWorkPriority.vue'
import WorkflowWorkSize from '@/components/Dataset/WorkflowWorkSize.vue'
import TemplateEditor from '@/components/DatasetSettings/TemplateEditor.vue'
import BreadCrumbInitializer, { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import updateDataset from '@/store/modules/dataset/actions/updateDataset'
import { DatasetPayload, ValidationError, StoreActionPayload } from '@/store/types'

@Component({
  name: 'dataset-create-annotators',
  components: {
    Info,
    InputField,
    TemplateEditor,
    WorkflowWorkPriority,
    WorkflowWorkSize
  },
  mixins: [BreadCrumbInitializer]
})
export default class DatasetCreateAnnotators extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  get breadCrumbs (): BreadCrumb[] {
    return [
      { to: '/datasets', name: 'Datasets' },
      { to: `/datasets/create/${this.dataset.id}/annotators`, name: 'Dataset Creation' }
    ]
  }

  workPrioritization: string = 'inserted_at:asc'
  workSize: number = 30

  $refs!: Vue['$refs'] & {
    templateEditor: TemplateEditor
    workSize: InputField
  }

  @Watch('dataset', { immediate: true })
  onDatasetLoaded (dataset: DatasetPayload | undefined): void {
    if (!dataset) { return }
    this.workPrioritization = dataset.work_prioritization || 'inserted_at:asc'
    this.workSize = dataset.work_size || 30
  }

  updateErrors (validationErrors: ValidationError): void {
    if (this.$refs.workSize) {
      (this.$refs.workSize as any).setError(validationErrors.workSize)
    }
  }

  validateForm (): ValidationError {
    const validationErrors: ValidationError = {}

    if (isNaN(this.workSize)) {
      validationErrors.workSize = 'Task size should be number.'
    }

    return validationErrors
  }

  async onContinue (): Promise<void> {
    const clientValidationErrors = this.validateForm()
    if (Object.keys(clientValidationErrors).length > 0) {
      this.updateErrors(clientValidationErrors)
      this.$ga.event('create_dataset', 'continue_step_4', 'failure_form_invalid')
      return
    }

    const templateResponse = await this.$refs.templateEditor.saveWorkflowTemplate()

    if ('error' in templateResponse) {
      const { error } = templateResponse
      // this will be a parsed error response, or a constructer error,
      // not an axios response so no status to report
      const status = undefined
      this.$ga.event(
        'create_dataset',
        'continue_step_4',
        'failure_request_failed',
        status
      )
      this.$store.dispatch('toast/warning', { content: error.message })
      return
    }

    const { dataset, workSize, workPrioritization } = this

    const updateDatasetParams: StoreActionPayload<typeof updateDataset> = {
      dataset,
      params: {
        workSize,
        workPrioritization
      }
    }

    const { error } = await this.$store.dispatch('dataset/updateDataset', updateDatasetParams)

    if (error) {
      this.$ga.event(
        'create_dataset',
        'continue_step_4',
        'failure_request_failed',
        error.response && error.response.status
      )
      return this.updateErrors(error)
    }

    this.$ga.event('create_dataset', 'continue_step_4', 'success')

    const { params } = this.$route
    this.$router.push({ name: 'DatasetManagementData', params })
  }
}
</script>

<style lang="scss" scoped>
.dataset-create__box {
  @include col;
  padding: 40px;
}

.dataset-create__annotators {
  flex: 1;
  width: 100%;
  margin-bottom: 18px;
  overflow: hidden auto;

  :deep(.template__stages) {
    flex: 1;
  }
}

.dataset-create__annotators__task-settings {
  width: 40%;
  height: fit-content;
  margin-left: 30px;
  padding: 15px 18px;
  border: 2px solid $colorSecondaryLight1;
  border-radius: 5px;
  @include col;
}

.dataset-create__annotators__work-size {
  margin-bottom: 10px;
}

.dataset-create__actions {
  @include row;
  justify-content: flex-end;
}
</style>
