<template>
  <settings-pane
    title="Plans"
    class="plans-settings-pane"
    :loading="billingInfoLoading || invoicesLoading"
  >
    <template #body>
      <div class="plans__tabs">
        <positive-button
          class="plans__tabs__tab"
          :class="{'plans__tabs__tab--active': currentTab === 'plan-usage'}"
          @click.prevent="() => currentTab = 'plan-usage'"
        >
          Plan Usage
        </positive-button>
        <positive-button
          v-if="$can('manage_customer')"
          class="plans__tabs__tab"
          :class="{'plans__tabs__tab--active': currentTab === 'billing'}"
          @click.prevent="() => currentTab = 'billing'"
        >
          Billing
        </positive-button>
      </div>
      <div class="plans__body">
        <div v-if="currentTab === 'plan-usage'">
          <template v-if="$can('manage_customer')">
            <products-v3
              v-if="billingInfo"
              class="plans__body__content"
              @billing-error="onBillingError"
            />
            <payment-issues class="plans__body__content" />
          </template>
          <no-access-to-customer v-else />
        </div>
        <div v-if="currentTab === 'billing'">
          <billing-address
            v-if="billingInfo"
            class="plans__body__content"
          />
          <credit-card class="plans__body__content" />
          <invoice-billing class="plans__body__content" />
          <invoices class="plans__body__content plans__body__content--invoices" />
        </div>
      </div>
    </template>
  </settings-pane>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import BillingAddress from '@/components/Plans/BillingAddress.vue'
import CreditCard from '@/components/Plans/CreditCard.vue'
import InvoiceBilling from '@/components/Plans/InvoiceBilling.vue'
import Invoices from '@/components/Plans/Invoices.vue'
import PaymentIssues from '@/components/Plans/PaymentIssues.vue'
import NoAccessToCustomer from '@/components/Plans/Product/NoAccessToCustomer.vue'
import ProductsV3 from '@/components/Plans/ProductsV3.vue'
import { CardStatus } from '@/store/modules/billing/types'

import SettingsPane from './SettingsPane.vue'

@Component({
  name: 'plans',
  components: {
    BillingAddress,
    CreditCard,
    Invoices,
    PaymentIssues,
    NoAccessToCustomer,
    ProductsV3,
    InvoiceBilling,
    SettingsPane
  }
})
export default class Plans extends Vue {
  @State(state => state.billing.billingInfo)
  billingInfo!: boolean

  @State(state => state.billing.cardStatus)
  cardStatus!: CardStatus

  @Getter('stripe', { namespace: 'billing' })
  stripe!: any

  currentTab: 'plan-usage' | 'billing' = 'plan-usage'

  mounted () {
    this.$store.dispatch('billing/loadCountries')
    this.loadBillingInfo()
    if (this.$can('manage_customer')) { this.loadInvoices() }
  }

  billingInfoLoading: boolean = false

  async loadBillingInfo () {
    this.billingInfoLoading = true
    await this.$store.dispatch('billing/loadBillingInfo')
    this.billingInfoLoading = false
  }

  invoicesLoading: boolean = false

  async loadInvoices () {
    this.invoicesLoading = true
    await this.$store.dispatch('billing/loadInvoices')
    this.invoicesLoading = false
  }

  close () {
    this.$emit('close')
  }

  onBillingError (code: string): void {
    if (code === 'BILLING_ADDRESS_INFO_MISSING') { this.currentTab = 'billing' }
    if (code === 'PAYMENT_NOT_SETUP') { this.currentTab = 'billing' }
  }
}
</script>

<style lang="scss" scoped>
.billing {
  @include col;
  width: 100%;
  height: 100%;
}

.plans-settings-pane {
  position: relative;
}

.plans__title {
  @include typography(md, default, bold);
  color: $colorSecondaryLight;
  padding: 50px;
  padding-bottom: 25px;
  background-color: $colorGriteDark2;
}

.plans__tabs {
  @include row--center;
  justify-content: center;
  background: linear-gradient($colorSecondaryLight3 50%, transparent 50%);
  position: absolute;
  left: 0; right: 0;
  z-index: 1;
}

.plans__tabs__tab {
  background: $colorSecondaryLight4;
  border: none;
  border-radius: 0;
  color: $colorSecondaryLight;

  &:first-child {
    border-top-left-radius: $border-radius-default;
    border-bottom-left-radius: $border-radius-default;
  }

  &:last-child {
    border-top-right-radius: $border-radius-default;
    border-bottom-right-radius: $border-radius-default;
  }

  &:active {
    opacity: 1;
  }

  &:hover {
    background: $colorLineGrey;
    color: $colorSecondaryDark1;

  }

  &--active {
    background: $colorPrimaryLight;
    color: $colorWhite;
    box-shadow: 0px 2px 10px rgba(11, 36, 72, 0.2);
    border-radius: $border-radius-default;

    &:hover {
      background: $colorPrimaryLight1;
      color: $colorWhite;
    }
  }
}

.plans__body {
  padding: 50px 120px;
  flex: 1 1 auto;
  overflow: visible auto;

  div {
    margin: 10px 0;
  }
}

.plans__body__content:not(:last-child) {
  margin-bottom: 50px;
}

.plans__body__content {
  &--payment-method {
    max-width: 80%;
  }

  &--invoices {
    max-width: 90%;
  }
}

.plans-settings-pane :deep(.settings-pane__body) {
  padding: 0;
}
</style>
