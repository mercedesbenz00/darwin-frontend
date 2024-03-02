import { Vue, Watch, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DatasetItemPayload } from '@/store/types'

/**
 * In charge of loading a time summary for the selected dataset item.
 *
 * This summary is used in Stages.vue to render time spent on a stage, per user.
 */
@Component({ name: 'time-summary-loader' })
export default class TimeSummaryLoader extends Vue {
  @State(state => state.workview.selectedDatasetItem)
  item!: DatasetItemPayload | null

  mounted () { this.loadSummary() }

  @Watch('item')
  onItem () { this.loadSummary() }

  loadSummary () {
    const { item } = this
    if (!item) { return }
    this.$store.dispatch('workview/loadTimeSummary', item)
  }

  render () { return null }
}
