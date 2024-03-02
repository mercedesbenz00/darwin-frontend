<template>
  <div class="dataset-overview">
    <div class="dataset-overview__header">
      <div class="dataset-overview__header-left">
        <h1 class="dataset-overview__title">
          Datasets
        </h1>
        <search-field
          v-model="search"
          class="dataset-overview__search"
        />
      </div>
      <div class="dataset-overview__sort">
        <sort-dropdown
          v-model="sortBy"
          :direction="sortDirection"
          :options="sortOptions"
          @change="onSortChange($event, 'by')"
          @change-direction="onSortChange($event, 'direction')"
        />
      </div>
      <upload-progress-button
        v-if="uploadInProgress"
        class="dataset-overview__button"
        dismissable
      />
      <primary-button
        v-else
        tag="router-link"
        size="medium"
        to="/datasets/create"
      >
        + New Dataset
      </primary-button>
    </div>
    <div class="dataset-section">
      <dataset-overlay-box class="dataset-section__overlay" />

      <div class="dataset-section__content">
        <dataset-card
          v-for="dataset in filteredDatasets"
          :key="dataset.id"
          class="dataset-section__card"
          :data="dataset"
          :style="cardStyle"
          @delete="onDeleteDataset"
        />
        <div
          v-if="count > 0 && filteredDatasets.length === 0"
          class="dataset-section__no-content"
        >
          No Datasets with keyword "{{ search }}"
        </div>
        <create-dataset-card
          class="dataset-section__card"
          :style="cardStyle"
        />
      </div>
    </div>
    <dataset-channel-subscriber :dataset="loadingDataset" />
    <delete-confirmation-dialog
      ref="deleteConfirmationDialog"
      title="Are you sure you want to delete this dataset?"
      :detail="datasetDeleteDetail"
      button-text="DELETE DATASET"
      @confirmed="onDatasetDeletionConfirmed"
    />
  </div>
</template>

<script lang="ts">
import { mixins } from 'vue-class-component'
import { Component, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V1'
import SearchField from '@/components/Common/SearchField.vue'
import SortDropdown from '@/components/Common/SortDropdown/V1/SortDropdown.vue'
import CreateDatasetCard from '@/components/Dataset/CreateDatasetCard.vue'
import DatasetCard from '@/components/Dataset/DatasetCard/V1/DatasetCard.vue'
import DatasetOverlayBox from '@/components/Dataset/DatasetOverlayBox.vue'
import UploadProgressButton from '@/components/Dataset/UploadProgressButton.vue'
import DatasetChannelSubscriber from '@/components/DatasetManagement/Renderless/DatasetChannelSubscriber'
import CardResizerMixin from '@/mixins/card-resizer'
import ScalerMixin from '@/mixins/scaler'
import { TeamPayload } from '@/store/modules/admin/types'
import { DatasetPayload } from '@/store/types'
import { notifyError, errorMessages, isErrorResponse } from '@/utils'

@Component({
  name: 'index-others',
  components: {
    CreateDatasetCard,
    DatasetCard,
    DatasetOverlayBox,
    DatasetChannelSubscriber,
    DeleteConfirmationDialog,
    SearchField,
    SortDropdown,
    UploadProgressButton
  }
})
export default class IndexOthers extends mixins(CardResizerMixin, ScalerMixin) {
  @State(state => state.dataset.datasets)
  datasets!: DatasetPayload[]

  @State(state => state.datasetUpload.datasetId)
  datasetId!: number | null

  @Getter('uploadInProgress', { namespace: 'datasetUpload' })
  uploadInProgress!: boolean

  search: string = ''
  sortBy: string = 'inserted_at'
  sortDirection: string = 'asc'
  datasetToDelete: DatasetPayload | null = null

  $refs!: {
    deleteConfirmationDialog: DeleteConfirmationDialog
  }

  get loadingDataset (): DatasetPayload | undefined  {
    return this.datasets
      .find(({ id }) => id === this.datasetId)
  }

  get filteredDatasets () {
    return this.datasets
      .filter((p: any) => (
        !this.search || this.search === '' ||
          p.name.toLowerCase().includes(this.search.toLowerCase())
      ))
      .sort((a: any, b: any) => {
        let coeff = 1
        if (this.sortDirection === 'desc') { coeff = -1 }
        if (a[this.sortBy] < b[this.sortBy]) { return -coeff }
        if (a[this.sortBy] > b[this.sortBy]) { return coeff }
        return 0
      })
  }

  get count () {
    return this.datasets.length
  }

  get sortOptions () {
    return [{
      text: 'Date created',
      icon: '/static/imgs/sort/date-created.svg',
      id: 'inserted_at'
    }, {
      text: 'Images',
      icon: '/static/imgs/sort/images.svg',
      id: 'num_images'
    }, {
      text: 'Classes',
      icon: '/static/imgs/sort/classes.svg',
      id: 'num_classes'
    }, {
      text: 'Annotations',
      icon: '/static/imgs/sort/annotations.svg',
      id: 'num_annotations'
    }, {
      text: 'Progress',
      icon: '/static/imgs/sort/progress.svg',
      id: 'progress'
    }, {
      text: 'Date modified',
      icon: '/static/imgs/sort/date-modified.svg',
      id: 'updated_at'
    }]
  }

  onDeleteDataset (dataset: DatasetPayload) {
    this.datasetToDelete = dataset
    this.$refs.deleteConfirmationDialog.show()
  }

  async onDatasetDeletionConfirmed () {
    try {
      await this.$store.dispatch('dataset/deleteDataset', this.datasetToDelete)
    } catch (err: unknown) {
      if (!isErrorResponse(err)) { throw err }
      notifyError(this.$store, err, errorMessages.DATASET_DELETE)
    }
    this.$refs.deleteConfirmationDialog.close()
  }

  onSortChange (val: string, type: string) {
    if (type === 'by') {
      this.sortBy = val
    } else if (type === 'direction') {
      this.sortDirection = val
    }
  }

  // dataset loading

  @State(state => state.team.currentTeam)
  team!: TeamPayload

  @Watch('team')
  onTeam () {
    if (!this.team) { return }
    this.getDatasets()
  }

  public mounted () {
    this.getDatasets()
  }

  getDatasets () {
    this.$store.dispatch('dataset/getDatasets')
  }

  // Card resize part
  cardStyle: object = {
    width: '100%',
    margin: '20px 14px'
  }

  createIndex: number = 3

  protected resize () {
    const bp = this.breakpoint()
    const margin = this.mqMargins[bp]

    this.createIndex = this.columns(bp) - 1
    this.cardStyle = {
      width: this.colWidth(bp, margin * 2),
      margin: `20px ${margin}px`
    }
  }

  readonly datasetDeleteDetail = [
    'This will delete any classes and unpublished datasets associated to this dataset,',
    'and all users in your Team will immediately lose access to it.'
  ].join(' ')
}
</script>

<style lang="scss" scoped>
.dataset-overview {
  @include col;
  @include fullsize;
  position: absolute;
}

.dataset-overview__header {
  @include row--distributed--center;
  margin-bottom: 3px;
  margin: 23px 50px 0 50px;
}

.dataset-overview__header-left {
  flex: 1 1 auto;
  @include row;
  align-items: center;
}

.dataset-overview__title {
  @include typography(xxl, mulish, bold);
  color: $color90Black;
  margin-right: 40px;
}

.dataset-overview__search {
  width: 225px;
}

.dataset-overview__sort {
  width: 225px;
  margin-right: 20px;
}

.dataset-overview__button {
  height: 35px;
}

.dataset-section {
  flex: 1 1 auto;
  position: relative;
  @include col--center;
  overflow: hidden;
  padding-top: 5px;
}

.dataset-section__overlay {
  margin: 15px 40px 0;
  width: calc(100% - 80px);
}

.dataset-section__content {
  flex: 1 1 auto;
  width: 100%;
  display: block;
  padding: 0 40px 0;
  overflow-y: auto;
  height: 100%;

  @include respondFrom(lg) {
    padding: 0 35px 0;
  }
  @include respondFrom(xl) {
    padding: 0 33px 0;
  }
}

.dataset-section__no-content {
  position: absolute;
  @include fullsize;
  @include row--center;
  padding: 15px 40px;
}

.dataset-section__card {
  width: calc(50% - 20px);
  margin: 20px 9px;
  vertical-align: middle;

  @include respondFrom(lg) {
    width: calc(50% - 28px);
    margin: 20px 14px;
  }
  @include respondFrom(xl) {
    width: calc(33.3% - 34px);
    margin: 20px 17px;
  }
  @include respondFrom(xxl) {
    width: calc(25% - 34px);
  }
  @include respondFrom(xxxl) {
    width: calc(20% - 34px);
  }
  @include respondFrom(xivl) {
    width: calc(16.67% - 34px);
  }
  @include respondFrom(xvl) {
    width: calc(10% - 34px);
  }
}
</style>
