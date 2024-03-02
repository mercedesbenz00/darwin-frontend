<template>
  <div
    ref="container"
    class="new-model"
  >
    <bread-crumbs />
    <div class="header">
      <h1 class="header__title">
        New Model
      </h1>
      <start-training-button />
    </div>
    <new-model-validator />
    <wizard
      class="new-model__wizard"
      :step.sync="step"
      :steps="['type', 'dataset', 'summary']"
      @step="scrollToStep"
    >
      <template #step="{ onContinue, index }">
        <model-type-setup
          v-if="index === 0"
          @continue="onContinue"
        />
        <model-dataset-setup
          v-else-if="index === 1"
          @continue="onContinue"
        />
        <div
          v-else-if="index === 2"
          class="new-model__wizard__summary"
        >
          <model-training-summary />
          <model-summary />
        </div>
      </template>
    </wizard>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

import BreadCrumbs from '@/components/Common/BreadCrumbs/V1/BreadCrumbs.vue'
import Wizard from '@/components/Common/Wizard.vue'
import ModelDatasetSetup from '@/components/ModelCreation/ModelDatasetSetup.vue'
import ModelSummary from '@/components/ModelCreation/ModelSummary.vue'
import ModelTrainingSummary from '@/components/ModelCreation/ModelTrainingSummary.vue'
import ModelTypeSetup from '@/components/ModelCreation/ModelTypeSetup.vue'
import NewModelValidator from '@/components/ModelCreation/NewModelValidator'
import StartTrainingButton from '@/components/ModelCreation/StartTrainingButton.vue'
import BreadCrumbInitializer, { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import { NeuralModelValidationErrors } from '@/store/modules/neuralModel/types'
@Component({
  name: 'new-model-view',
  components: {
    BreadCrumbs,
    ModelDatasetSetup,
    ModelSummary,
    ModelTrainingSummary,
    ModelTypeSetup,
    NewModelValidator,
    StartTrainingButton,
    Wizard
  },
  mixins: [BreadCrumbInitializer]
})
export default class NewModelView extends Vue {
  get breadCrumbs (): BreadCrumb[] {
    return [
      { to: '/models', name: 'Models' },
      { name: 'New Model' }
    ]
  }

  step: number = 0

  /**
   * When the wizard reports a step change, we are given the offsetTop of the
   * element containing the step. We dynamically scroll to 20px above that
   * element.
   */
  scrollToStep (step: number, offsetTop: number) {
    const container = this.$refs.container as HTMLDivElement
    if (!container) { return }
    container.scrollTo({
      top: offsetTop - 20,
      behavior: 'smooth'
    })
  }

  @Watch('$store.state.neuralModel.newModelValidationErrors')
  onErrors (errors: NeuralModelValidationErrors) {
    const { step } = this
    if ((errors.name || errors.template) && step > 0) {
      this.step = 0
      return
    }

    if ((errors.classes || errors.dataset || errors.items) && step > 1) {
      this.step = 1
    }
  }
}
</script>

<style lang="scss" scoped>
.new-model {
  background: $colorAliceShade;
  height: 100%;
  overflow: auto;

  padding: 20px 50px;
}

.header {
  display: grid;
  grid-auto-flow: column;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
}

.header__title {
  @include typography(xxl-4, mulish, bold)
}

.new-model__wizard__summary {
  display: grid;
  grid-template-rows: auto auto;
  row-gap: 40px;

  > :last-child {
    justify-self: end;
    min-width: 45%;
  }
}
</style>
