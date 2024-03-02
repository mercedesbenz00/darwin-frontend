import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DatasetPayload, DatasetItemFilter } from '@/store/types'

/**
 * Loads item counts for the current dataset, based on current filter
 *
 * Renderless component
 */
@Component({ name: 'item-count-loader' })
export default class ItemCountLoader extends Vue {
  @Prop({ type: Boolean, default: false })
  openWorkMode!: boolean

  @State(state => state.workview.dataset)
  dataset!: DatasetPayload

  @State(state => state.workview.datasetItemFilter)
  filter!: DatasetItemFilter

  @Watch('dataset')
  onDataset () { this.loadCounts() }

  @Watch('filter')
  onFilter () { this.loadCounts() }

  loadCounts () {
    this.$store.dispatch('workview/loadDatasetItemCounts', { openWorkMode: this.openWorkMode })
  }

  render () {
    return null
  }
}
