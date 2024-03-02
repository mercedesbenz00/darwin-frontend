<template>
  <primary-button
    :disabled="!valid || noCredits"
    @click="startTraining"
  >
    Start Training
  </primary-button>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { BillingInfoPayload } from '@/store/modules/billing/types'
import { NeuralModelValidationErrors } from '@/store/modules/neuralModel/types'
import { annotationCreditsRemainingThisPeriod } from '@/utils/billing'

@Component({ name: 'start-training-button' })
export default class StartTrainingButton extends Vue {
  @State(state => state.neuralModel.newModelValidationErrors)
  validationErrors!: NeuralModelValidationErrors

  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  billingInfoLoading: boolean = false

  async mounted () {
    this.billingInfoLoading = true
    await this.$store.dispatch('billing/loadBillingInfo')
    this.billingInfoLoading = false
  }

  get valid (): boolean {
    return Object.keys(this.validationErrors).length === 0
  }

  get noCredits (): boolean {
    const { billingInfo } = this
    if (!billingInfo) { return false }
    return annotationCreditsRemainingThisPeriod(billingInfo) <= 0
  }

  async startTraining (): Promise<void> {
    const response = await this.$store.dispatch('neuralModel/trainModel')

    if ('error' in response) {
      if (response.error.isValidationError) {
        this.$store.dispatch('toast/warning', {
          content: "Couldn't start training. Your request contained some errors."
        })
      } else if (response.error.message) {
        this.$store.dispatch('toast/warning', { content: response.error.message })
      }
      return
    }

    this.$router.push('/models')
  }
}
</script>
