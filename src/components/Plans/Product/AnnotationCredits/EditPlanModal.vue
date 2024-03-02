<template>
  <modal
    :name="modalName"
    width="720"
    height="480"
    :adaptive="true"
    :focus-trap="true"
    @closed="onClosed"
  >
    <div class="edit-plan">
      <button
        class="edit-plan__downgrade"
        :disabled="newAmount === 0"
        type="button"
        @click="downgrade"
      >
        <downgrade-icon />
      </button>

      <edit-plan-teaser
        :amount="newAmount"
        :plan="planName"
      />
      <edit-product-layout
        class="edit-plan__main"
        :confirm-disabled="updateDisabled"
        :disabled="busy"
        @cancel="hideModal"
        @confirm="submitUpdate"
      >
        <template
          v-if="needContactSales"
          #confirm
        >
          Talk to Sales
        </template>
        <template #current>
          <product-layout-section
            class="edit-plan__main__new"
            :text="billedNextPeriod.toString()"
            subtext="Current Plan Credits"
          />
        </template>
        <template #new>
          <new-amount
            :value="newAmount"
            :min="0"
            :step="100"
            label="New Amount"
            @change="updateNewAmount"
            @clean="enableUpdate"
            @dirty="preventUpdate"
          />
        </template>
        <template
          v-if="willLockout"
          #issues
        >
          <div>
            Warning: This amount is too low for the current usage,
            and will suspend the team's annotation capabilities.
          </div>
        </template>

        <template #extra>
          <div class="edit-plan__extra">
            <div
              v-if="needHidePrice"
              class="edit-plan__cost-container"
            >
              <span class="edit-plan__cost">Talk to Sales</span>
            </div>
            <template v-else>
              <div
                class="edit-plan__cost-container"
              >
                <span class="edit-plan__cost">{{ formattedCost }}</span>
                <span>per month{{ newAmount === 100 ? ' (minimum)' : '' }} billed annually</span>
              </div>
              <div
                v-if="discountMessage"
                class="edit-plan__discount"
              >
                ({{ discountMessage }})
              </div>
            </template>
            <feature-list
              class="edit-plan__feature-list"
              :features="features"
            />
          </div>
        </template>
      </edit-product-layout>

      <button
        class="edit-plan__upgrade"
        :disabled="currentPlan === 'enterprise'"
        type="button"
        @click="upgrade"
      >
        <upgrade-icon />
      </button>
    </div>
  </modal>
</template>

<script lang="ts">
import { capitalize } from 'lodash'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import EditProductLayout from '@/components/Plans/Product/Common/EditProductLayout.vue'
import NewAmount from '@/components/Plans/Product/Common/NewAmount.vue'
import ProductLayoutSection from '@/components/Plans/Product/Common/ProductLayoutSection.vue'
import {
  PlanFeature,
  SubscriptionPlanName,
  resolveDisplayPlanName,
  resolveFeaturesForPlan,
  resolveProductPrice,
  resolveUndiscountedProductPrice,
  resolvePlanForCredit,
  PlanPricing,
  subscriptionPlans
} from '@/components/Plans/Product/utils'
import {
  BillingInfoPayload,
  CustomerSubscriptionPayload,
  ProductType
} from '@/store/modules/billing/types'
import { formatSubCurrency, formatDecimal } from '@/utils'
import { annotationCreditsBilledNextPeriod } from '@/utils/billing'

import EditPlanTeaser from './EditPlanTeaser.vue'
import FeatureList from './FeatureListV2.vue'
import DowngradeIcon from './assets/downgrade.svg?inline'
import UpgradeIcon from './assets/upgrade.svg?inline'

const isValidPlan = (plan: string): plan is keyof typeof PlanPricing => plan in PlanPricing

@Component({
  name: 'annotation-credits',
  components: {
    DowngradeIcon,
    EditPlanTeaser,
    EditProductLayout,
    FeatureList,
    NewAmount,
    ProductLayoutSection,
    UpgradeIcon
  }
})
export default class AnnotationCredits extends Vue {
  @Prop({ required: false })
  initialPlan?: keyof typeof PlanPricing

  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  get subscription (): CustomerSubscriptionPayload {
    const { billingInfo: { customer_subscription: subscription } } = this
    if (!subscription) { throw new Error('Invalid customer subscription data') }
    return subscription
  }

  get prices (): BillingInfoPayload['prices']['annotation_credits'] {
    const { billingInfo: { prices } } = this
    if (!prices) { throw new Error('Invalid customer pricing data') }
    return prices[ProductType.AnnotationCredits]
  }

  get bonus (): number { return this.subscription.annotation_credits_bonus }
  get used (): number { return this.subscription.annotation_credits_used }

  get billedNextPeriod (): number {
    return annotationCreditsBilledNextPeriod(this.billingInfo)
  }

  get displayLegacyEssentials (): boolean {
    const { billingInfo, billedNextPeriod } = this

    if (!billingInfo.freemium && billedNextPeriod === PlanPricing.freemium) {
      return true
    }
    return false
  }

  get planName (): SubscriptionPlanName {
    const { currentPlan, displayLegacyEssentials } = this
    if (currentPlan === 'freemium') {
      if (displayLegacyEssentials) {
        return 'essentials'
      }
    }
    return currentPlan
  }

  get currentPlan (): SubscriptionPlanName {
    return resolvePlanForCredit(this.newAmount)
  }

  get updateDisabled (): boolean {
    return this.newAmount === this.billedNextPeriod
  }

  get needContactSales (): boolean {
    return this.newAmount >= PlanPricing.team || this.billedNextPeriod >= PlanPricing.team
  }

  get needHidePrice (): boolean {
    return this.billedNextPeriod < PlanPricing.team && this.newAmount >= PlanPricing.team
  }

  modalName = ProductType.AnnotationCredits

  hideModal (): void {
    this.resetAll()
    this.$modal.hide(this.modalName)
  }

  onClosed (): void {
    this.resetAll()

    if (!this.$route.query.upgrade) { return }
    this.$router.replace({ query: { ...this.$route.query, upgrade: undefined } })
  }

  newAmount: number = 0
  busy: boolean = false

  mounted (): void {
    this.maybeOpen()
    this.setNewAmount()
  }

  @Watch('billedNextPeriod')
  setNewAmount (): void {
    this.resetAll()
  }

  @Watch('initialPlan')
  onInitialPlan (): void {
    this.resetAll()
  }

  resetAll (): void {
    const { upgrade } = this.$route.query
    if (upgrade && typeof upgrade === 'string' && isValidPlan(upgrade)) {
      this.newAmount = PlanPricing[upgrade]
      return
    }

    if (this.initialPlan) {
      this.newAmount = PlanPricing[this.initialPlan]
      return
    }

    // in case of  freemium plan
    if (this.billingInfo.freemium) {
      this.newAmount = PlanPricing.freemium
      return
    }

    // in case of other plan
    this.newAmount = this.billedNextPeriod
  }

  /**
   * Apply steps between different pricing plans
   */
  updateNewAmount (newValue: number): void {
    const { newAmount: oldValue, billingInfo } = this
    if (newValue === 0) {
      this.newAmount = 0
    } else if (newValue <= PlanPricing.freemium) {
      if (newValue !== PlanPricing.freemium && newValue < oldValue) {
        this.newAmount = 0
      } else {
        if (!billingInfo.freemium) {
          this.newAmount = PlanPricing.team
        } else {
          this.newAmount = PlanPricing.freemium
        }
      }
    } else if (newValue <= PlanPricing.team) {
      if (newValue !== PlanPricing.team && newValue < oldValue) {
        if (billingInfo.freemium) {
          this.newAmount = PlanPricing.freemium
        } else {
          this.newAmount = 0
        }
      } else {
        this.newAmount = PlanPricing.team
      }
    } else if (newValue <= PlanPricing.business) {
      if (newValue !== PlanPricing.business && newValue < oldValue) {
        this.newAmount = PlanPricing.team
      } else {
        this.newAmount = PlanPricing.business
      }
    } else {
      this.newAmount = newValue
    }
  }

  get newCost (): number {
    if (this.newAmount === PlanPricing.freemium) {
      if (!this.displayLegacyEssentials) {
        return 0
      }
    }
    return resolveProductPrice(this.newAmount, this.prices.standard)
  }

  get newUndiscountedCost (): number {
    return resolveUndiscountedProductPrice(this.newAmount, this.prices.standard)
  }

  get newAutomationActions (): number {
    return Math.floor(this.newAmount * 3600 / 36)
  }

  get discountMessage (): string | null {
    const { newAmount, newCost, newUndiscountedCost, prices } = this
    const discount = newUndiscountedCost - newCost
    if (discount <= 0 || newCost === 0) { return null }
    const tiers = prices.standard ? prices.standard.tiers || [] : []
    const currentPerUnit = (tiers || []).find(t => t.up_to === null || t.up_to > newAmount)
    if (!currentPerUnit) { throw new Error('Invalid pricing data for annotation credits ') }
    const discountPerUnit = currentPerUnit.unit_amount

    const perUnit = formatSubCurrency(discountPerUnit)
    const totalSaved = formatSubCurrency(discount)
    return `Quantity discount: ${perUnit}/unit (${totalSaved} saved)`
  }

  get formattedCost (): string {
    return formatSubCurrency(this.newCost)
  }

  get features (): PlanFeature[] {
    const { currentPlan, newAmount, subscription, displayLegacyEssentials } = this
    const actions = Math.floor(newAmount * 3600 / subscription.seconds_per_automation_action)

    const annualNewAmount: number = newAmount * 12
    const annualActions: number = actions * 12

    const features = [
      { label: `Up to ${annualNewAmount} hours of annotation per year`, or: true, enabled: true },
      { label: `Up to ${formatDecimal(annualActions)} automation actions per year`, enabled: true },
      ...resolveFeaturesForPlan(displayLegacyEssentials ? 'essentials' : currentPlan)
    ]

    if (newAmount === 0) {
      return features.map(feature => ({ ...feature, enabled: true }))
    }
    return features
  }

  preventUpdate (): void { this.busy = true }
  enableUpdate (): void { setTimeout(() => { this.busy = false }, 200) }

  get willLockout (): boolean {
    return this.used > (this.newAmount + this.bonus)
  }

  downgrade (): void {
    const { currentPlan } = this
    const index = subscriptionPlans.indexOf(currentPlan)
    if (index < 0) { return }
    if (index === 0) {
      this.newAmount = 0
    } else {
      // When subscribed to any other plans than freemium,
      // cannot downgrade to freemium
      if (!this.billingInfo.freemium && index === 1) {
        this.newAmount = 0
      } else {
        this.newAmount = PlanPricing[subscriptionPlans[index - 1]]
      }
    }
  }

  upgrade (): void {
    const { currentPlan, newAmount } = this
    if (newAmount === 0) {
      // When subscribed to any other plans than freemium,
      // cannot downgrade to freemium
      if (!this.billingInfo.freemium) {
        this.newAmount = PlanPricing.team
      } else {
        this.newAmount = PlanPricing.freemium
      }
      return
    }
    const index = subscriptionPlans.indexOf(currentPlan)
    if (index + 1 > subscriptionPlans.length - 1) { return }
    this.newAmount = PlanPricing[subscriptionPlans[index + 1]]
  }

  submitUpdate (): void {
    this.onPlanUpdate(this.newAmount, this.needContactSales)
  }

  onPlanUpdate (newAmount: number, needContactSales: boolean): void {
    if (needContactSales) {
      this.contactSales(newAmount)
      this.hideModal()
    } else {
      if (newAmount === 0) {
        this.$modal.show('typeform-modal')
      } else if (newAmount === PlanPricing.freemium) {
        this.$modal.show('switch-open-dataset-modal')
      } else {
        this.updateProduct(newAmount)
      }
    }
  }

  contactSales (newAmount: number): void {
    const { $intercom } = this
    if ($intercom) {
      const newPlanName = capitalize(resolveDisplayPlanName(resolvePlanForCredit(newAmount)))
      $intercom.trackEvent('upgrade_request', { plan: newPlanName })
      const message =
        `Hi V7 Team, we'd like to explore upgrading to the "${newPlanName}" Plan.` +
        ' Looking forward to hearing from you.'
      $intercom.showNewMessage(message)
    }
  }

  async updateProduct (newAmount: number): Promise<void> {
    this.busy = true

    const { error } = await this.$store.dispatch('billing/setSubscriptionAmount', {
      type: ProductType.AnnotationCredits,
      value: newAmount
    })

    this.busy = false

    if (error) {
      this.$emit('billing-error', error.code)
      return this.$store.dispatch('toast/warning', { content: error.message })
    }

    this.$emit('submit', newAmount)
    this.hideModal()
  }

  @Watch('$route.query.upgrade', { immediate: true })
  maybeOpen (): void {
    if (!this.$route.query.upgrade) {
      return
    }
    this.$modal.show(this.modalName)
  }
}
</script>

<style lang="scss" scoped>
.edit-plan {
  @include row;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 42px 48px;
  background: $colorAliceBlue;
}

.edit-plan__downgrade,
.edit-plan__upgrade {
  top: calc(50% - 29px);
  cursor: pointer;
  z-index: 1;
  transition: all .2s;
  outline: none;
  border: none;
  background: transparent;
  padding: 0;

  svg {
    width: 38px;
    height: 57px;
  }

  &:hover:not(:disabled) { opacity: 0.8; }
  &:active:not(:disabled) { opacity: 0.9; }

  &:disabled {
    opacity: 0.3;
  }
}

.edit-plan__downgrade {
  position: absolute;
  left: 25px;
}

.edit-plan__upgrade {
  position: absolute;
  right: 25px;
}

.edit-plan__main {
  width: 60%;
  padding: 0;
  overflow: hidden;
  grid-gap: 0;

  :deep(.edit-product__body) {
    grid-template-columns: 180px auto;
    height: 100%;
    overflow: hidden;
  }

  :deep(.product-section),
  :deep(.new-amount) {
    height: 100px;
    grid-template-rows: 1fr 30px;
  }

  :deep(.product-section) {
    grid-gap: 5px;
  }

  :deep(.product-section__text),
  :deep(.numeric-input__controls > input) {
    font-family: $fontFamilyDefault;
    font-size: 48px;
    line-height: 60px;
    font-weight: bold;
  }

  :deep(.product-section__subtext),
  :deep(.numeric-input__label) {
    @include typography(lg, default, bold);
  }

  :deep(.product-section__subtext) {
    margin-top: 4px;
  }
}

.edit-plan__main__new {
  color: $colorAliceNight;
}

.edit-plan__extra {
  width: 100%;
  @include col;
  overflow: hidden;
  padding: 0 20px;
}

.edit-plan__cost-container {
  margin: 12px 0;
  @include typography(md);
  color: $color90Black;

  & > span:not(:last-child) {
    margin-right: 3px;
  }
}

.edit-plan__cost {
  @include typography(xl-1, default, bold);
  color: $color90Black;
}

.edit-plan__discount {
  @include typography(sm, default, bold);
  color: $colorFeatherLight;
}

.edit-plan__feature-list {
  flex: 1;
  overflow-y: auto;
  @include scrollbar;
}
</style>
