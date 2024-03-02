<template>
  <stage-item
    :item="template"
    @assign="assignStage"
  >
    <template #main>
      <status-button
        class="template"
        :class="{'template--selected': isSelected}"
        :type="template.type"
        @click="selectStageTemplate"
      />
    </template>
  </stage-item>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import StatusButton from '@/components/WorkView/Common/StatusButton/V2/StatusButton.vue'
import { assignStage } from '@/store/modules/workview/actions/assignStage'
import {
  DatasetItemPayload,
  MembershipPayload,
  StoreActionPayload,
  WorkflowStageTemplatePayload
} from '@/store/types'
import { ErrorCodes } from '@/utils/error/errors'

import StageItem from './StageItem.vue'

@Component({
  name: 'stage-template-with-assignment',
  components: { StageItem, StatusButton }
})
export default class StageTemplateWithAssignment extends Vue {
  @Prop({ required: true, type: Object as () => WorkflowStageTemplatePayload })
  template!: WorkflowStageTemplatePayload

  @State(state => state.workview.selectedStageTemplate)
  selectedTemplate!: WorkflowStageTemplatePayload | null

  get isSelected (): boolean {
    const { template, selectedTemplate } = this
    return !!selectedTemplate && selectedTemplate.id === template.id
  }

  selectStageTemplate () {
    const { template } = this
    this.$store.commit('workview/SET_SELECTED_STAGE_INSTANCE', null)
    this.$store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', template)
  }

  @State(state => state.workview.selectedDatasetItem)
  datasetItem!: DatasetItemPayload

  async assignStage (member: MembershipPayload) {
    const { datasetItem, template } = this

    const { error } = await this.$store.dispatch('workview/createWorkflow', datasetItem)

    if (error && error.code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
      this.$store.commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
      return
    }

    if (error) { this.$store.dispatch('toast/warning', { content: error.message }) }

    const { datasetItem: updatedItem } = this

    const prefix = '[StageTemplateWithAssignment]'

    if (!updatedItem || !updatedItem.current_workflow) {
      const message = "Couldn't resolve workflow for selected item when assigning template"
      throw new Error(`${prefix}: ${message}`)
    }

    const stages = updatedItem.current_workflow.stages[template.stage_number]
    const stage = stages.find(s => s.assignee_id === null)
    if (!stage) {
      const message = "Workflow was created, but unassigned stage couldn't be found."
      throw new Error(`${prefix}: ${message}`)
    }

    const payload: StoreActionPayload<typeof assignStage> = { stage, userId: member.user_id }
    const { error: assignError } =
      await this.$store.dispatch('workview/assignStage', payload)

    if (assignError) {
      return this.$store.dispatch('toast/warning', { content: assignError.message })
    }
  }
}
</script>
<style lang="scss" scoped>
.template.status-button,
.template:hover.status-button {
  @include workflow-status-background-color;
  color: $colorWhite;
}
</style>
