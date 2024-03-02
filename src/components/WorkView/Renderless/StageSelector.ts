import { Vue, Watch, Component } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import {
  DatasetItemPayload,
  DatasetPayload,
  WorkflowTemplatePayload,
  UserPayload
} from '@/store/types'

/**
 * Reports image change to workview channel on backend
 *
 * Renderless component
 */
@Component({ name: 'stage-selector' })
export default class StageSelector extends Vue {
  @State(state => state.workview.selectedDatasetItem)
  datasetItem!: DatasetItemPayload | null

  @State(state => state.workview.dataset)
  dataset!: DatasetPayload

  @Getter('defaultWorkflowTemplate', { namespace: 'workview' })
  getDefaultWorkflowTemplate!: (dataset: DatasetPayload) => WorkflowTemplatePayload | undefined

  get defaultWorkflowTemplate () {
    if (!this.dataset) { return null }
    return this.getDefaultWorkflowTemplate(this.dataset) || null
  }

  mounted () {
    this.resolveStage()
  }

  @Watch('datasetItem')
  onDatasetItem () { this.resolveStage() }

  @Watch('defaultWorkflowTemplate')
  onDefaultWorkflowTemplate () { this.resolveStage() }

  @State(state => state.user.profile)
  user!: UserPayload | null

  resolveStage () {
    const { datasetItem, defaultWorkflowTemplate, user } = this

    // match/select by active workflow current stage number
    if (datasetItem && datasetItem.current_workflow) {
      const currentStageNumber = datasetItem.current_workflow.current_stage_number
      const instances = datasetItem.current_workflow.stages[currentStageNumber]

      const instance = user
        ? instances.find(i => i.assignee_id === user.id) || instances[0]
        : instances[0]

      this.$store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', null)
      this.$store.commit('workview/SET_SELECTED_STAGE_INSTANCE', instance)
      return
    }

    // match/select first template (stage number 1) in default workflow
    if (defaultWorkflowTemplate) {
      const stageTemplate =
        defaultWorkflowTemplate.workflow_stage_templates.find(t => t.stage_number === 1)
      this.$store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', stageTemplate)
      this.$store.commit('workview/SET_SELECTED_STAGE_INSTANCE', null)
      return
    }

    this.$store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', null)
    this.$store.commit('workview/SET_SELECTED_STAGE_INSTANCE', null)
  }

  render () {
    return null
  }
}
