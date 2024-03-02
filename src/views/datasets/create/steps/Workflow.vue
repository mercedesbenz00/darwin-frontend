<template>
  <div class="dataset-create__box">
    <h3 class="dataset-create__step-title">
      Pick a workflow
    </h3>
    <div class="dataset-create__tab-header">
      <custom-button
        @click="switchTab(0)"
        :color="selectedTab === 0 ? 'primary' : 'secondary'"
        class="dataset-create__tab-header-item"
      >
        Templates
      </custom-button>

      <custom-button
        @click="switchTab(1)"
        :color="selectedTab === 1 ? 'primary' : 'secondary'"
        class="dataset-create__tab-header-item"
      >
        Your Workflows
      </custom-button>
    </div>
    <div
      class="dataset-create-templates__wrapper"
      v-if="selectedTab === 0"
    >
      <template-card
        v-for="template in templates"
        :key="template.id"
        :id="template.id"
        :name="template.name"
        :selected="template.id === selectedTemplateId"
        @click="onClickTemplate"
      />
    </div>
    <div
      class="dataset-create-workflows__wrapper"
      v-if="selectedTab === 1"
    >
      <workflow-card
        v-for="workflow in workflows"
        class="dataset-create-workflows__card"
        :key="workflow.id"
        :data="workflow"
        :selected="workflow.id === selectedWorkflowId"
        :selectable="true"
        :show-actions="false"
        disable-menu
        @click="onClickWorkflow"
      />
    </div>

    <div class="dataset-create__actions">
      <custom-button
        flair="rounded"
        color="primary"
        size="large"
        @click="onContinue"
        :disabled="!selectedWorkflowId && !selectedTemplateId"
      >
        Pick {{ selectedTab === 0 ? 'Template' : 'Workflow' }}
      </custom-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CustomButton } from '@/components/Common/Button/V2'
import Info from '@/components/Common/Info.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import WorkflowWorkPriority from '@/components/Dataset/WorkflowWorkPriority.vue'
import WorkflowWorkSize from '@/components/Dataset/WorkflowWorkSize.vue'
import TemplateEditor from '@/components/DatasetSettings/TemplateEditor.vue'
import WorkflowCard from '@/components/Workflow/WorkflowCard.vue'
import BreadCrumbInitializer, { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import { initBasicWorkflow } from '@/store/modules/V2Workflow/mutations/INITIALIZE_WORKFLOW'
import {
  DatasetPayload,
  RootState,
  V2WorkflowPayload
} from '@/store/types'
import { appendNumber } from '@/utils/string'
import TemplateCard from '@/views/datasets/create/TemplateCard.vue'
import { TemplateCardProps } from '@/views/datasets/create/TemplateCardTypes'
import { cloneWorkflow } from '@/views/datasets/utils/cloneWorkflow'

@Component({
  name: 'dataset-create-workflow',
  components: {
    CustomButton,
    Info,
    InputField,
    TemplateEditor,
    TemplateCard,
    WorkflowCard,
    WorkflowWorkPriority,
    WorkflowWorkSize
  },
  mixins: [BreadCrumbInitializer]
})
export default class DatasetCreateWorkflow extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @State((state: RootState) => state.v2Workflow.workflows)
  workflows!: V2WorkflowPayload[]

  selectedTab: number = 0

  get breadCrumbs (): BreadCrumb[] {
    return [
      { to: '/datasets', name: 'Datasets' },
      { to: `/datasets/create/${this.dataset.id}/annotators`, name: 'Dataset Creation' }
    ]
  }

  get selectedWorkflow (): V2WorkflowPayload | undefined {
    return this.workflows.find(workflow => workflow.id === this.selectedWorkflowId)
  }

  get templates (): Partial<TemplateCardProps>[] {
    return [{ id: 1, name: 'Basic workflow', selected: true }]
  }

  get selectedTemplateName (): string | undefined {
    return this.templates.find(template => template.selected)?.name
  }

  get workflowBuilderFn (): typeof initBasicWorkflow {
    return initBasicWorkflow
  }

  selectedWorkflowId: string | null = null
  selectedTemplateId: number | null = this.templates[0].id ?? null

  onClickWorkflow (id: string): void {
    this.selectedTemplateId = null
    this.selectedWorkflowId = id
  }

  onClickTemplate (id: number): void {
    this.selectedWorkflowId = null
    this.selectedTemplateId = id
  }

  switchTab (tab: number): void {
    if (tab === 0) {
      this.selectedWorkflowId = null
    } else {
      this.selectedTemplateId = null
    }
    this.selectedTab = tab
  }

  async onContinue (): Promise<void> {
    if (!this.selectedWorkflow && !this.selectedTemplateId) {
      this.$toast.warning({
        duration: 3000,
        meta: {
          title: 'No template/workflow selected'
        }
      })
      return
    }
    const workflow = this.selectedWorkflow
      ? cloneWorkflow({
        workflow: this.selectedWorkflow,
        datasetId: this.dataset.id,
        workflowName: appendNumber(
          this.selectedWorkflow.name,
          this.workflows.map(x => x.name)
        )!
      })
      : this.workflowBuilderFn(
        {
          datasetId: this.dataset.id,
          workflowName: appendNumber(
            this.selectedTemplateName,
            this.workflows.map(x => x.name)
          )
        }
      )
    this.$store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflow)
    const { data, error } = await this.$store.dispatch('v2Workflow/submitWorkflow')
    // navigate to the workflow scene
    if (error) {
      this.$toast.warning({
        duration: 3000,
        meta: {
          title: 'Failed to clone the workflow'
        }
      })
      return
    }
    this.$toast.info({
      duration: 3000,
      meta: {
        title: 'New workflow created. Navigating to the workflow scene...'
      }
    })
    this.$router.push('/workflows/' + data.id)
  }
}
</script>

<style lang="scss" scoped>
$spacing: 12px;

.dataset-create__box {
  @include col;
  padding: 40px;
  overflow: hidden;
  background-color: $colorNeutralsWhite;
}

.dataset-create__tab-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: $spacing 0;

  .dataset-create__tab-header-item.color--primary {
    color: #2359FB !important;
    background-color: #CED7F2;
    &:hover {
      background-color: #CED7F2;
    }
  }
}

.dataset-create-workflows__wrapper,
.dataset-create-templates__wrapper {
  @include row--wrap;
  width: 100%;
  margin: $spacing 0;
  overflow: auto;
  gap: $spacing;
}

.dataset-create-workflows__card {
  @include col;
  flex: 0 1 auto;
  vertical-align: middle;

  @include respondFromTo(normal, sm) {
    width: 100%;
  }
  @include respondFromTo(sm, lg) {
    width: calc(50% - #{$spacing});
  }
  @include respondFrom(lg) {
    width: 320px;
  }
}

.dataset-create__step-title {
  @include typography(xl-2, inter, 500);
  color: $colorSecondaryDark1;
}

.dataset-create__actions {
  margin-top: auto;
  @include row;
  justify-content: flex-end;
}
</style>
