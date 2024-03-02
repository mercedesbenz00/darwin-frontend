<template>
  <router-view
    v-if="dataset && currentDataset.id !== null"
    :dataset="dataset"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import RouteError from '@/router/RouteError'
import { DatasetPayload, Dataset } from '@/store/types'

@Component({ name: 'dataset-detail' })
export default class DatasetDetail extends Vue {
  get datasetId (): number {
    const { datasetId } = this.$route.params
    if (datasetId) { return parseInt(datasetId) }
    throw new RouteError({ route: this.$route, missingParams: ['datasetId'] })
  }

  @State(state => state.dataset.currentDataset)
  currentDataset!: Dataset

  @Getter('findById', { namespace: 'dataset' })
  datasetById!: (id: number) => DatasetPayload | null

  get dataset (): DatasetPayload | null {
    return this.datasetById(this.datasetId)
  }

  async mounted () {
    const { datasetId } = this
    if (!datasetId) { return }

    await this.$store.dispatch('dataset/resetCurrentDataset')
    await this.$store.dispatch('dataset/loadDataset', { datasetId })
    this.$store.commit('dataset/SET_CURRENT_DATASET_ID', datasetId)
  }

  beforeDestroy () {
    this.$store.dispatch('dataset/resetCurrentDataset')
  }
}
</script>
