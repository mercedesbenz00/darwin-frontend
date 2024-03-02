<template>
  <modal
    v-if="showDialog"
    name="switch-open-dataset-modal"
    :width="500"
    height="auto"
    transition="pop-out"
    :classes="['switch-open-dataset-modal']"
    :click-to-close="false"
  >
    <confirmation-dialog-layout>
      <template #title>
        Switch to Open Datasets?
      </template>
      <template
        #description
      >
        {{ description }}
      </template>
      <template #footer>
        <secondary-button
          @click.stop="cancel"
        >
          Manage Plans
        </secondary-button>
        <primary-button
          @click.stop="confirm"
        >
          Confirm
        </primary-button>
      </template>
    </confirmation-dialog-layout>
  </modal>
</template>

<script lang="ts">
import capitalize from 'lodash/capitalize'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Location } from 'vue-router'
import { State } from 'vuex-class'

import ConfirmationDialogLayout from '@/components/Common/ConfirmationDialogLayout.vue'
import {
  SubscriptionPlanName,
  resolveDisplayPlanName,
  resolvePlanForCredit,
  PlanPricing
} from '@/components/Plans/Product/utils'
import { BillingInfoPayload, ProductType } from '@/store/modules/billing/types'
import { RootState, TeamPayload } from '@/store/types'
import { annotationCreditsBilledNextPeriod } from '@/utils/billing'

@Component({
  name: 'plan-expired-dialog',
  components: { ConfirmationDialogLayout }
})
export default class SwitchOpenDatasetsDialog extends Vue {
  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  @State((state: RootState) => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload | null

  get description (): string {
    const { currentPlan } = this
    return `As part of the ${capitalize(resolveDisplayPlanName(currentPlan))} plan,
     your datasets and annotations will be made open-source
     for the wider academic community, under a Creative Commons 4.0 license`
  }

  get billedNextPeriod (): number {
    const { billingInfo } = this
    if (billingInfo) {
      return annotationCreditsBilledNextPeriod(billingInfo)
    }
    return 0
  }

  get currentPlan (): SubscriptionPlanName {
    const { billingInfo } = this

    if (!billingInfo || billingInfo.freemium) {
      return 'freemium'
    }
    return resolvePlanForCredit(this.billedNextPeriod)
  }

  get plansLocation (): Location {
    const { name, params, query } = this.$route
    if (name === 'Workflow') {
      return {
        name: 'DatasetsIndex',
        query: { settings: 'plans' }
      }
    }
    return {
      name: name || undefined,
      params,
      query: { ...query, settings: 'plans' }
    }
  }

  get showDialog () {
    if (!this.currentTeam) { return false }
    return this.$can('view_customer')
  }

  async mounted (): Promise<void> {
    await this.loadBillingInformation()
  }

  @Watch('currentTeam')
  onCurrentTeamUpdate (): void { this.loadBillingInformation() }

  async loadBillingInformation (): Promise<void> {
    if (!this.showDialog) { return }
    await this.$store.dispatch('billing/loadBillingInfo')
  }

  cancel (): void {
    this.$modal.hide('switch-open-dataset-modal')
  }

  async confirm (): Promise<void> {
    const { error } = await this.$store.dispatch('billing/setSubscriptionAmount', {
      type: ProductType.AnnotationCredits,
      value: PlanPricing.freemium
    })

    if (error) {
      return this.$store.dispatch('toast/warning', { content: error.message })
    }
    this.$modal.hide('switch-open-dataset-modal')
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.switch-open-dataset-modal {
  @include confirmation-dialog-modal;
}
</style>
