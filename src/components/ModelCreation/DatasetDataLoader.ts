import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DatasetPayload } from '@/store/types'

/**
 * Loads additional details for selected dataset during model creation
 */
@Component({ name: 'dataset-data-loader' })
export default class DatasetDataLoader extends Vue {
  render () {
    return null
  }

  @State(state => state.neuralModel.newModelDataset)
  dataset!: DatasetPayload

  @Watch('dataset.id', { immediate: true })
  onDataset () {
    this.loadData()
  }

  async loadData () {
    this.$emit('dataset-loading')
    await Promise.all([
      this.$store.dispatch('neuralModel/loadNewModelDatasetClasses'),
      this.$store.dispatch('neuralModel/loadNewModelClassCounts')
    ])
    this.$emit('dataset-loaded')
  }
}
