import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import {
  Dataset,
  DatasetReportPayload,
  DatasetReportClassDistributionPayload,
  TrainingSessionPayload
} from '@/store/types'

@Component
export default class DatasetReportLoader extends Vue {
  @Prop({ required: false })
  trainingSession!: TrainingSessionPayload | undefined

  @State(state => state.dataset.datasets)
  datasets!: Dataset[]

  get dataset (): Dataset | null {
    const { trainingSession, datasets } = this

    if (trainingSession) {
      return datasets.find(
        d => trainingSession.dataset_identifier === `${d.team_slug}/${d.slug}`
      ) || null
    }

    return null
  }

  @Watch('dataset', { immediate: true })
  onDatasetChanged (dataset: Dataset) {
    this.loadReport(dataset)
  }

  async loadReport (dataset?: Dataset | null) {
    if (dataset) {
      const { error } = await this.$store.dispatch('dataset/getReport', { datasetId: dataset.id })

      if (error) {
        this.$store.dispatch('toast/warning', { content: error.message })
      }
    }
  }

  @Getter('findReportById', { namespace: 'dataset' })
  findReportById!: (id: number) => DatasetReportPayload | null

  get report (): DatasetReportPayload | null {
    if (this.dataset && this.dataset.id) {
      return this.findReportById(this.dataset.id)
    }

    return null
  }

  get datasetDistributions (): DatasetReportClassDistributionPayload[] {
    if (this.report) {
      return this.report.class_distribution_by_item
    }

    return []
  }
}
