import { Vue, Watch, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DatasetPayload } from '@/store/types'

/**
 * In charge of loading the active workflow the selected dataset item.
 *
 * This is used across the workview.
 */
@Component({ name: 'default-workflow-loader' })
export default class DefaultWorkflowLoader extends Vue {
  @State(state => state.workview.dataset)
  dataset!: DatasetPayload | null

  mounted () { this.loadDefaultWorkflow() }

  @Watch('dataset')
  onDataset () { this.loadDefaultWorkflow() }

  loadDefaultWorkflow () {
    const { dataset } = this
    if (!dataset) { return }
    this.$store.dispatch('workview/loadWorkflowTemplate', dataset)
  }

  render () { return null }
}
