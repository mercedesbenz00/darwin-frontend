<template>
  <div class="billing-address">
    <div class="billing-address__header">
      Billing Details
    </div>
    <div class="billing-address__content">
      <div class="billing-address__section">
        <input-field
          v-model="name"
          :error="errors.name"
          autocomplete="given-name"
          label="Business or person name"
          name="name"
          type="text"
          theme="light"
        />
      </div>
      <div class="billing-address__section">
        <input-field
          v-model="email"
          :error="errors.email"
          autocomplete="email"
          label="Billing email"
          name="email"
          type="text"
          theme="light"
        />
      </div>
      <div class="billing-address__section">
        <input-field
          v-model="line1"
          :error="errors.line1"
          autocomplete="address-line1"
          label="Address Line 1"
          name="line1"
          type="text"
          theme="light"
        />
      </div>
      <div class="billing-address__section">
        <input-field
          v-model="line2"
          :error="errors.line2"
          autocomplete="address-line2"
          label="Address Line 2"
          name="line2"
          type="text"
          theme="light"
        />
      </div>
      <div class="billing-address__section">
        <input-field
          v-model="postalCode"
          type="text"
          name="postalCode"
          label="Postcode / ZIP"
          autocomplete="postal-code"
          theme="light"
          :error="errors.postalCode"
        />
      </div>
      <div class="billing-address__section">
        <input-field
          v-model="city"
          :error="errors.city"
          autocomplete="address-level2"
          label="City"
          name="city"
          type="text"
          theme="light"
        />
      </div>
      <div class="billing-address__section">
        <input-field
          v-model="state"
          :error="errors.state"
          autocomplete="address-level1"
          label="State (optional)"
          name="state"
          type="text"
          theme="light"
        />
      </div>
      <div class="billing-address__section">
        <dropdown
          id="country"
          v-model="country"
          :error="errors.country"
          :options="countryOptions"
          theme="light"
          label="Country"
          name="country"
          search
        />
      </div>
      <div class="billing-address__section">
        <input-field
          v-model="taxId"
          :error="errors.taxId"
          type="text"
          name="taxId"
          label="Tax ID"
          theme="light"
        />
      </div>
    </div>
    <positive-button
      size="medium"
      @click="save"
    >
      Save
    </positive-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Dropdown from '@/components/Common/Dropdown/LegacyDropdown.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import updateBillingInfo from '@/store/modules/billing/actions/updateBillingInfo'
import {
  BillingInfoPayload,
  Country,
  CustomerValidationErrors
} from '@/store/modules/billing/types'
import { StoreActionPayload } from '@/store/types'

@Component({ name: 'billing-address', components: { Dropdown, InputField } })
export default class BillingAddress extends Vue {
  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  @State(state => state.billing.countries)
  countries!: Country[]

  city: string | null = null
  country: string | null = null
  email: string | null = null
  line1: string | null = null
  line2: string | null = null
  name: string | null = null
  state: string | null = null
  taxId: string | null = null
  postalCode: string | null = null

  errors: CustomerValidationErrors = {}

  get countryOptions (): Array<{ id: string, text: string }> {
    return this.countries.map(c => ({ id: c.alpha2, text: c.name }))
  }

  mounted () {
    this.setData(this.billingInfo)
  }

  setErrors (errors: CustomerValidationErrors) {
    this.errors = {
      city: errors.city,
      country: errors.country,
      email: errors.email,
      line1: errors.line1,
      line2: errors.line2,
      name: errors.name,
      state: errors.state,
      taxId: errors.taxId,
      postalCode: errors.postalCode
    }
  }

  clearErrors () {
    this.setErrors({})
  }

  setData (billingInfo: BillingInfoPayload) {
    this.email = billingInfo.email
    this.name = billingInfo.name
    this.taxId = billingInfo.tax_id

    const { address } = billingInfo

    if (!address) { return }
    this.line1 = address.line_1
    this.line2 = address.line_2
    this.postalCode = address.postal_code
    this.city = address.city
    this.state = address.state
    this.country = address.country
  }

  getData (): StoreActionPayload<typeof updateBillingInfo> {
    return {
      address: {
        city: this.city,
        country: this.country,
        line_1: this.line1,
        line_2: this.line2,
        postal_code: this.postalCode,
        state: this.state
      },
      email: this.email,
      name: this.name,
      tax_id: this.taxId
    }
  }

  async save () {
    this.clearErrors()
    const { error } = await this.$store.dispatch('billing/updateBillingInfo', this.getData())
    if (error) {
      if (error.message) { this.$store.dispatch('toast/warning', { content: error.message }) }
      return this.setErrors(error)
    }
    this.$store.dispatch('toast/notify', { content: 'Billing info succesfully updated' })
  }
}
</script>

<style lang="scss" scoped>
.billing-address__content {
  display: grid;
  grid-column-gap: 40px;
  grid-row-gap: 15px;
  grid-template-columns: calc(50% - 20px) calc(50% - 20px);
  margin-bottom: 25px;
}

.billing-address__header {
  @include typography(lg-1, headlines, bold);
  color: $colorSecondaryDark1;
  margin-bottom: 25px;
}

.billing-address__title {
  @include typography(md, default, bold);
  color: $colorPrimaryDark;
}

.billing-address__section:last-child {
  grid-column: 2;
}

.billing-address__section__label {
  @include typography(md, default);
  line-height: 15px;
  letter-spacing: 0.2px;
  color: #A4AFC5;
  margin-bottom: 6px;
}

</style>
