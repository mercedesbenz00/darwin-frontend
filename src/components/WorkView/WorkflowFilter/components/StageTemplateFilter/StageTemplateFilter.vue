<template>
  <stage-template-filter
    v-if="activeWorkflowTemplate"
    class="workflow-filter__templates"
    :positive-stage-template-ids="positiveStageTemplateIds"
    :negative-stage-template-ids="negativeStageTemplateIds"
    :workflow-template="activeWorkflowTemplate"
    @change="updateFilter"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import StageTemplateFilter from '@/components/DatasetFiltering/StageTemplateFilter/StageTemplateFilter.vue'
import { DatasetPayload, RootState, WorkflowTemplatePayload } from '@/store/types'

@Component({
  name: 'workflow-filter-stage-template-filter',
  components: { StageTemplateFilter }
})
export default class WorkflowFilterStageTemplateFilter extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @Prop({ required: false, default: () => [] })
  positiveStageTemplateIds!: number[]

  @Prop({ required: false, default: () => [] })
  negativeStageTemplateIds!: number[]

  @State((state: RootState) => state.workview.workflowTemplates)
  workflowTemplates!: WorkflowTemplatePayload[]

  get activeWorkflowTemplate (): WorkflowTemplatePayload | null {
    return this.workflowTemplates.find(
      t => t.id === this.dataset.default_workflow_template_id
    ) || null
  }

  updateFilter (
    params: {
      positiveStageTemplateIds: number[],
      negativeStageTemplateIds: number[]
    }
  ): void {
    this.$emit('update:positive-stage-template-ids', params.positiveStageTemplateIds)
    this.$emit('update:negative-stage-template-ids', params.negativeStageTemplateIds)
    this.$emit('change', params)
  }
}
</script>

<style lang="scss" scoped>
.workflow-filter__templates {
  width: 100%;
}
</style>
