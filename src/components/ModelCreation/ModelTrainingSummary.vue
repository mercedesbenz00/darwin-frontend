<template>
  <alice-blue-panel class="summary">
    <div class="summary__header">
      <h2 class="summary__header__title">
        Here's what will happen
      </h2>
      <div class="tune-parameters-placeholder">
        <!-- this div should be replaced with tune parameters button -->
      </div>
    </div>
    <div class="summary__sets">
      <div class="summary__sets__set set">
        <div class="set__count">
          {{ counts.training }}
        </div>
        <div class="set__title">
          Training Set
        </div>
        <div class="set__help">
          <strong>80%</strong> of the images will be used in the training set.
        </div>
      </div>
      <div class="summary__sets__set set">
        <div class="set__count">
          {{ counts.validation }}
        </div>
        <div class="set__title">
          Validation Set
        </div>
        <div class="set__help">
          <strong>10%</strong> of the images will be used in the validation set
          to periodically test the model performance.
        </div>
      </div>
      <div class="summary__sets__set set">
        <div class="set__count">
          {{ counts.test }}
        </div>
        <div class="set__title">
          Test Set
        </div>
        <div class="set__help">
          <strong>10%</strong> of the images will be stored away and only tested
          once training is complete, to present a realistic accuracy score.
        </div>
      </div>
    </div>
  </alice-blue-panel>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import AliceBluePanel from '@/components/Common/Panel/AliceBluePanel.vue'
import { getTrainingCounts } from '@/components/ModelCreation/utils'
import { DatasetPayload, RootState } from '@/store/types'

@Component({
  name: 'model-training-summary',
  components: { AliceBluePanel }
})
export default class ModelTrainingSummary extends Vue {
  mounted () {
    this.loadCounts()
  }

  @State(state => state.neuralModel.newModelDataset)
  dataset!: DatasetPayload | null

  @State(state => state.neuralModel.newModelSelectedClassIds)
  classIds!: number[]

  loading: boolean = false
  @Watch('classIds')
  onClassIds () { this.loadCounts() }

  @Watch('dataset')
  onDataset () { this.loadCounts() }

  async loadCounts (): Promise<void> {
    const { classIds, dataset } = this
    if (!dataset || classIds.length === 0) { return }
    this.loading = true
    await this.$store.dispatch('neuralModel/loadNewModelTrainingCounts')
    this.loading = false
  }

  @State((state: RootState) => state.neuralModel.newModelTrainingCounts)
  total!: number | null

  get counts (): { training: number, validation: number, test: number } {
    const { total } = this
    return getTrainingCounts(total)
  }
}
</script>

<style lang="scss" scoped>
.summary {
  min-height: 320px;

  display: grid;
  grid-template-rows: auto 1fr;
  row-gap: 40px;
}

.summary__header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  justify-content: space-between;
}

.summary__header__title {
  @include typography(xl-1, mulish, bold);
  font-size: 22px;
}

.summary__sets {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-items: center;
}

.set {
  display: grid;
  grid-template-rows: auto auto 1fr;
  grid-gap: 20px;
  justify-items: center;
  max-width: 200px;
}

.set__count {
  @include typography(xxl, mulish, bold);

}

.set__title {
  @include typography(md-1, mulish, bold);
}

.set__help {
  @include typography(md, mulish);
  text-align: center;

  strong {
    font-weight: bold;
  }
}
</style>
