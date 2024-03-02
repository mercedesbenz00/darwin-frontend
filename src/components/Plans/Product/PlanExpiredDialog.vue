<template>
  <modal
    v-if="showDialog"
    name="plan-expired-modal"
    width="30%"
    height="auto"
    :min-width="200"
    :max-width="500"
    transition="pop-out"
    :classes="['plan-expired-modal']"
    :click-to-close="false"
  >
    <confirmation-dialog-layout>
      <template #title>
        Your team's plan has expired
      </template>
      <template
        #description
      >
        You can resume your subscription anytime to regain access to your team's features.
      </template>
      <template #footer>
        <primary-button
          tag="router-link"
          :to="plansLocation"
        >
          MANAGE PLAN
        </primary-button>
      </template>
    </confirmation-dialog-layout>
  </modal>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Location } from 'vue-router'
import { State } from 'vuex-class'

import ConfirmationDialogLayout from '@/components/Common/ConfirmationDialogLayout.vue'
import { BillingInfoPayload } from '@/store/modules/billing/types'
import { RootState, TeamPayload } from '@/store/types'

@Component({
  name: 'plan-expired-dialog',
  components: { ConfirmationDialogLayout }
})
export default class PlanExpiredDialog extends Vue {
  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  @State((state: RootState) => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload | null

  get noSubscription (): boolean {
    const { billingInfo } = this
    if (!billingInfo || !billingInfo.customer_subscription) { return true }
    const { annotation_credits_standard: standard } = billingInfo.customer_subscription
    return standard === 0
  }

  get ready (): boolean {
    return !!this.billingInfo
  }

  get noCredits (): boolean {
    const { billingInfo } = this
    if (!billingInfo || !billingInfo.customer_subscription) { return false }
    const {
      annotation_credits_bonus: bonus,
      annotation_credits_standard_max_in_period: standard,
      annotation_credits_used: used
    } = billingInfo.customer_subscription
    return (bonus + standard - used) <= 0
  }

  get isPlanExpired (): boolean {
    if (!this.$can('view_customer')) { return false }

    const { noSubscription, noCredits, ready } = this
    if (!ready) { return false }
    if (!noCredits) { return false }
    if (!noSubscription) { return false }
    return true
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

  async mounted () {
    await this.loadBillingInformation()
    this.onPlanExpired()
  }

  @Watch('isPlanExpired', { immediate: true })
  onPlanExpired () {
    if (this.isPlanExpired) {
      this.$modal.show('plan-expired-modal')
    } else {
      this.$modal.hide('plan-expired-modal')
    }
  }

  @Watch('currentTeam')
  onCurrentTeamUpdate () { this.loadBillingInformation() }

  async loadBillingInformation () {
    if (!this.showDialog) { return }
    await this.$store.dispatch('billing/loadBillingInfo')
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.plan-expired-modal {
  @include confirmation-dialog-modal;
}
</style>
