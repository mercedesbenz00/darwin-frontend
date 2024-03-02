<template>
  <alice-blue-panel class="datasets">
    <div class="datasets__sidebar sidebar">
      <h3 class="sidebar__header">
        Choose a Dataset
      </h3>
      <search-field
        v-model="search"
        class="sidebar__search"
      />
      <div class="sidebar__datasets">
        <dataset-card
          v-for="dataset in datasets"
          :key="dataset.id"
          :dataset="dataset"
        />
      </div>
    </div>
    <div class="datasets__main sampling-distribution">
      <item-sampling
        v-if="dataset"
        class="sampling-distribution__samples"
      />
      <class-selection
        v-if="dataset"
        v-loading="datasetLoading"
        class="sampling-distribution__distribution"
        :loading-options="{
          backgroundColor: $theme.getColor('colorSecondaryLight3'),
          label: 'Counting all annotations'
        }"
      />
      <div
        v-if="!datasetLoading && dataset && !valid"
        class="datasets__errors"
      >
        <error-tip>
          {{ errorsDescription }}
        </error-tip>
      </div>
    </div>
    <div class="datasets__footer footer">
      <primary-button
        :disabled="!valid"
        @click="$emit('continue')"
      >
        Continue
      </primary-button>
    </div>
    <dataset-data-loader
      v-if="dataset"
      @dataset-loading="datasetLoading = true"
      @dataset-loaded="datasetLoading = false"
    />
  </alice-blue-panel>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import ErrorTip from '@/components/Common/ErrorTip/ErrorTip.vue'
import AliceBluePanel from '@/components/Common/Panel/AliceBluePanel.vue'
import SearchField from '@/components/Common/SearchField.vue'
import { NeuralModelValidationErrors } from '@/store/modules/neuralModel/types'
import { DatasetPayload, DatasetItemPayload } from '@/store/types'

import ClassSelection from './ClassSelection.vue'
import DatasetCard from './DatasetCard.vue'
import DatasetDataLoader from './DatasetDataLoader'
import ItemSampling from './ItemSampling.vue'

@Component({
  name: 'model-dataset-setup',
  components: {
    AliceBluePanel,
    ClassSelection,
    DatasetCard,
    DatasetDataLoader,
    ErrorTip,
    ItemSampling,
    SearchField
  }
})
export default class ModelDatasetSetup extends Vue {
  @State(state => state.dataset.datasets)
  allDatasets!: DatasetPayload[]

  @State(state => state.neuralModel.newModelDataset)
  dataset!: DatasetPayload | null

  datasetLoading: boolean = false

  mounted () {
    this.$store.dispatch('dataset/getDatasets')
  }

  search: string = ''

  get datasets (): DatasetPayload[] {
    const { allDatasets, search } = this
    return allDatasets
      .filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
  }

  @State(state => state.neuralModel.newModelSampleItems)
  items!: DatasetItemPayload[]

  @State(state => state.neuralModel.newModelValidationErrors)
  validationErrors!: NeuralModelValidationErrors

  get valid (): boolean {
    const { classes, dataset, items } = this.validationErrors
    return [classes, dataset, items].filter(i => !!i).length === 0
  }

  get errorsDescription (): string | null {
    const { validationErrors: { classes, dataset, items }, valid } = this

    if (!valid) {
      return [classes, dataset, items].filter(i => !!i).join('. ')
    }

    return null
  }
}
</script>
<style lang="scss" scoped>
// layout must be computed, due to needing a scrollable middle container in both
// the left sidebar (for datasets), as well as the right main area (classes)
// while datasets are doable without pixel-perfect, classes are not the last item
// in the main container, so the only way to scroll them in a reliable way is to
// compute the entire layout

// inner height, sans padding of outer height
$layoutInnerHeight: 720px;

// general layout of the right side

// horizontal item list
$layoutRightSamples: 195px;
// margins between each section, 3 in total
$layoutRightMargin: 10px;
// error help
$layoutErrorHelp: 60px;
// height of the overall classes section
$layoutRightClasses: $layoutInnerHeight - $layoutRightSamples - $layoutRightMargin - $layoutErrorHelp;

// samples

$layoutSamplesHeader: 35px;
$layoutSamplesMargin: 10px;
$layoutSamplesContent: $layoutRightSamples - $layoutSamplesMargin - $layoutSamplesHeader;

// classes

// top header
$layoutClassesHeader: 35px;
// 4 margins total
$layoutClassesMargin: 5px;
// type selection
$layoutClassesTypes: 40px;
// select all button row
$layoutClassesSelectAll: 15px;
// bottom help button row, below class list
$layoutClassesHelp: 40px;

// classes table takes up the remaining space
$layoutClassesTable:
  $layoutRightClasses
  - $layoutClassesHeader
  - (4 * $layoutClassesMargin)
  - $layoutClassesTypes
  - $layoutClassesSelectAll
  - $layoutClassesHelp;

.datasets {
  display: grid;
  grid-template-columns: 280px 1fr;

  column-gap: 42px;
}

.datasets__main,
.datasets__sidebar {
  max-height: $layoutInnerHeight;
  overflow: hidden;
}

.datasets__sidebar {
  border-right: 1px solid $colorAliceShadow;
  padding-right: 20px;
}

.datasets__footer {
  grid-column: 1 / 3;
  justify-self: end;
}

.sidebar {
  display: grid;
  grid-template-rows: auto auto 1fr;
  row-gap: 10px;
}

.sidebar__header {
  @include typography(xl-1, Mulish, bold);
  padding-bottom: 10px;
}

.sidebar__datasets {
  border-radius: 3px;
  background: $colorAliceLight;
  box-shadow: $shadowInset;
  overflow-y: auto;
  @include scrollbar;

  row-gap: 16px;
  padding: 16px;
}

.sidebar__datasets .dataset {
  margin: 5px 0;
}

.sampling-distribution {
  display: grid;
  grid-template-rows: $layoutRightSamples $layoutRightClasses $layoutErrorHelp;
  row-gap: $layoutRightMargin;
  align-items: center;
}

.sampling-distribution__samples-header,
.sampling-distribution__distribution-header {
  @include typography(lg-1, Mulish, bold);
}

.sampling-distribution__samples {
  // prevents grid blowout
  // removing this will cause image samples to overflow
  min-width: 1px;

  display: grid;
  grid-template-rows: $layoutSamplesHeader $layoutSamplesContent;
  row-gap: $layoutSamplesMargin;

  > :nth-child(1) {
    align-self: center;
  }
}

.sampling-distribution__distribution {
  display: grid;
  grid-template-rows:
    $layoutClassesHeader
    $layoutClassesTypes
    $layoutClassesSelectAll
    $layoutClassesTable
    $layoutClassesHelp;
  row-gap: $layoutClassesMargin;

  align-items: stretch;

  > :nth-child(1),
  > :nth-child(3),
  > :nth-child(5) {
    align-self: center;
  }
}
</style>
