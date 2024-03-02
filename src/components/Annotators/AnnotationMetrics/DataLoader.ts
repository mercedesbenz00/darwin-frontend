import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { DatasetPayload } from '@/store/types'

import { AnnotationDataGranularity, AnnotationDataRange } from './types'
import { fromFromRange, granularityFromRange } from './utils'

/**
 * In charge of loading base data for a dataset in /annotators
 */
@Component({ name: 'data-loader' })
export default class DataLoader extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @Prop({ required: true, type: String })
  dataRange!: AnnotationDataRange

  get from (): string | null {
    return fromFromRange(this.dataRange)
  }

  get dataGranularity (): AnnotationDataGranularity {
    return granularityFromRange(this.dataRange)
  }

  mounted () {
    this.$store.dispatch('annotators/loadDatasetReport', this.dataset)
    if (this.$can('view_dataset_annotators')) {
      this.$store.dispatch('dataset/getAnnotators', { datasetId: this.dataset.id })
    }
    this.loadAnnotationReport()
  }

  @Watch('from')
  onFrom () { this.loadAnnotationReport() }

  /**
   * Loads annotation reports required to render /annotators data for a dataset
   *
   * Since data accessibility is determined by user role level, the "total"
   * report needs to be fetched separately from the backend and cannot be
   * computed from individual grouped reports.
   */
  async loadAnnotationReport () {
    const { dataset, from, dataGranularity: granularity } = this

    const totalParams = { dataset, from, granularity, groupBy: 'dataset' }
    const groupedParams = { dataset, from, granularity, groupBy: 'dataset,user' }

    await Promise.all([
      this.$store.dispatch('annotators/getAnnotationReport', totalParams),
      this.$store.dispatch('annotators/getAnnotationReport', groupedParams)
    ])
  }

  render () { return null }
}
