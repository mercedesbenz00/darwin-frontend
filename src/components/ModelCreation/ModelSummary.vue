<template>
  <alice-blue-panel class="model-summary">
    <h4 class="model-summary__header">
      Summary
    </h4>

    <training-info />
    <training-time />
    <training-cost />

    <div class="model-summary__help">
      <div>After that, {{ creditPerMinute }} credits/minute when the model is active.</div>
      <div>You can turn models on and off anytime.</div>
      <div>Training commences as soon as servers become available.</div>
    </div>
    <primary-button
      class="model-summary__submit"
      @click="onSubmit"
    >
      Start training
    </primary-button>
    <quote-dialog :open.sync="dialogOpen" />
  </alice-blue-panel>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import AliceBluePanel from '@/components/Common/Panel/AliceBluePanel.vue'
import { NeuralModelValidationErrors } from '@/store/modules/neuralModel/types'
import { CREDIT_PER_MINUTE } from '@/utils'

import QuoteDialog from './ModelSummary/QuoteDialog.vue'
import TrainingCost from './ModelSummary/TrainingCost.vue'
import TrainingInfo from './ModelSummary/TrainingInfo.vue'
import TrainingTime from './ModelSummary/TrainingTime.vue'

@Component({
  name: 'model-summary',
  components: {
    AliceBluePanel,
    QuoteDialog,
    TrainingCost,
    TrainingInfo,
    TrainingTime
  }
})
export default class ModelSummary extends Vue {
  @State(state => state.neuralModel.newModelValidationErrors)
  validationErrors!: NeuralModelValidationErrors

  readonly creditPerMinute = CREDIT_PER_MINUTE

  get valid (): boolean {
    return Object.keys(this.validationErrors).length === 0
  }

  dialogOpen: boolean = false

  @Watch('valid') onValidInvalid (): void {
    if (!this.valid) { this.dialogOpen = false }
  }

  onSubmit () {
    this.dialogOpen = true
  }
}
</script>
<style lang="scss" scoped>
.model-summary {
  display: grid;
  grid-auto-flow: row;
  row-gap: 25px;
  justify-content: end;
  justify-items: end;
}

.model-summary__header {
  @include typography(lg-1, headlines, bold);
}

.model-summary__help {
  @include typography(md-1, Mulish);
  color: $colorAliceNight;
  text-align: right;
}
</style>
