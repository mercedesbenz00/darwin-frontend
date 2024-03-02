<template>
  <span
    v-if="!isTargetPlan"
    class="upgrade-button"
  >
    <span>
      <upgrade-tfa-icon
        v-tooltip="{ content: `Upgrade to ${to} to unlock this feature` }"
        class="upgrade-button__icon"
        @click.stop="showModal"
      />
    </span>

    <portal to="modal">
      <edit-plan-modal
        :initial-plan="to"
        @submit="onPlanUpdateDone"
      />
    </portal>
  </span>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import UpgradeTfaIcon from '@/assets/icons/V1/upgrade-arrow.svg?inline'
import EditPlanModal from '@/components/Plans/Product/AnnotationCredits/EditPlanModal.vue'
import {
  resolvePlanForCredit,
  SubscriptionPlanName, PlanPricing
} from '@/components/Plans/Product/utils'
import { TeamPayload } from '@/store/modules/admin/types'
import { ProductType, BillingInfoPayload } from '@/store/modules/billing/types'
import { RootState } from '@/store/types'
import { annotationCreditsBilledNextPeriod } from '@/utils/billing'

/**
 * Upgrade current plan button with modal window included (using portal)
 *
 * @param {string} [to='enterprise'] - target upgrade level
 */
@Component({
  name: 'upgrade-to-btn',
  components: {
    UpgradeTfaIcon,
    EditPlanModal
  }
})
export default class UpgradeBtn extends Vue {
  @Prop({ default: 'enterprise', type: String })
  to!: SubscriptionPlanName

  @State((state: RootState) => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  get currentPlan (): SubscriptionPlanName {
    const { billingInfo } = this

    if (billingInfo.freemium) {
      return 'freemium'
    }
    const currentAmount = annotationCreditsBilledNextPeriod(billingInfo)
    return resolvePlanForCredit(currentAmount)
  }

  public get isTargetPlan (): boolean {
    return this.currentPlan === this.to
  }

  showModal (): void {
    this.$modal.show(ProductType.AnnotationCredits)
  }

  onPlanUpdateDone (
    newAmount: number
  ): void {
    if (newAmount < PlanPricing[this.to]) {
      return
    }
    this.$store.dispatch('team/getTeam', this.team.id)
  }
}
</script>

<style lang="scss" scoped>
.upgrade-button {
  cursor: pointer;
  display: inline-block;
  width: 30px;
  height: 30px;

  & > span {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 100%;
  }
}

.upgrade-button__icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  outline: none;
}
</style>
