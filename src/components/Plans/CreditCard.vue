<template>
  <div class="credit-card">
    <h3 class="credit-card__header">
      Payment Card
    </h3>
    <div
      v-if="editMode"
      class="credit-card__content"
    >
      <div class="credit-card__data credit-card__data--stripe">
        <div id="card-element">
          <div
            v-if="settingUp"
            class="credit-card__placeholder"
          >
            Loading...
          </div>
        </div>
      </div>
      <loading-wrapper
        :loading="settingUp"
        class="credit-card__loading-wrapper"
        size="small"
        background-color="transparent"
      >
        <secondary-button
          class="credit-card__button"
          size="medium"
          @click="cancel"
        >
          Cancel
        </secondary-button>
        <positive-button
          class="credit-card__button"
          size="medium"
          @click="submit"
        >
          Save
        </positive-button>
      </loading-wrapper>
      <div
        v-if="cardStatus && cardStatus.error"
        class="credit-card__error"
      >
        {{ cardStatus.error }}
      </div>
    </div>
    <div
      v-else
      class="credit-card__content"
    >
      <div
        v-if="card"
        class="credit-card__data"
      >
        <i :class="`credit-card__data__brand credit-card__data__brand--${brand}`">{{ brand }}</i>
        ending in {{ last4 }}
      </div>
      <div
        v-else
        class="credit-card__data"
      >
        No card on file
      </div>
      <positive-button
        class="credit-card__button"
        size="medium"
        @click="edit"
      >
        {{ buttonText }}
      </positive-button>
    </div>
    <div class="credit-card__notice">
      Make sure the billing details match those on the card.
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import LoadingWrapper from '@/components/Common/LoadingWrapper.vue'
import { BillingInfoPayload, CardStatus } from '@/store/modules/billing/types'
import { CardElement, stripe } from '@/utils/stripe'

@Component({ name: 'credit-card', components: { LoadingWrapper } })
export default class CreditCard extends Vue {
  editMode: boolean = false
  stripeElement: CardElement | null = null

  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload | null

  @State(state => state.billing.cardStatus)
  cardStatus!: CardStatus | null

  get card (): BillingInfoPayload['selected_source'] {
    return this.billingInfo ? this.billingInfo.selected_source : null
  }

  get brand (): string {
    return this.card ? this.card.brand : 'Unknown card'
  }

  get last4 (): string | null {
    return this.card ? this.card.last4 || null : null
  }

  get buttonText (): string {
    return this.card ? 'Update card' : 'Add card'
  }

  beforeDestroy () {
    if (!this.stripeElement) { return }
    this.stripeElement.unmount()
  }

  edit () {
    this.editMode = true
    // `$nextTick` is required due to #card-element presence being bound to `editMode`
    // as well, so there's no guarantee it will immediately appear
    this.$nextTick(() => this.setupStripe())
  }

  cancel () {
    this.editMode = false
    this.$store.commit('billing/SET_CARD_STATUS', null)
  }

  async submit () {
    const { error } = await this.$store.dispatch('billing/updateCard', this.getData())
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      if (error.isValidationError && error.card) {
        this.$store.commit('billing/SET_CARD_STATUS', { error: error.card, complete: false })
      }
      return
    }

    this.$store.dispatch('toast/notify', { content: 'Card information successfully updated' })
    this.cancel()
  }

  settingUp: boolean = true

  setupStripe () {
    this.settingUp = true

    const stripeService = stripe()

    if (!stripeService) {
      setTimeout(() => { this.setupStripe() }, 1000)
      return
    }

    const elements = stripeService.elements()
    this.stripeElement = elements.create('card', { hidePostalCode: true })

    this.stripeElement.mount('#card-element')
    this.stripeElement.on('change', (event) => {
      const error = event.error && event.error.message ? event.error.message : null
      const complete = event.complete === true
      this.$store.commit('billing/SET_CARD_STATUS', { error, complete })
    })

    this.settingUp = false
  }

  getData () {
    return {
      card: this.stripeElement
    }
  }
}
</script>

<style lang="scss" scoped>
.credit-card__error {
  color: $colorPink;
  width: 100%;
}

.credit-card__header {
  @include typography(lg-1, headlines, bold);
  color: $colorSecondaryDark1;
  margin-bottom: 25px;
}

.credit-card__content,
.credit-card__content .credit-card__loading-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.credit-card__data {
  margin-right: 25px;
  color: $colorSecondaryDark1;
}

.credit-card__data--stripe {
  width: 400px;
  background: transparent;
  padding-bottom: 10px;
  border-bottom: 1px solid $colorGrayLite2;
}

.credit-card__placeholder,
.credit-card__notice {
  @include typography(md);
  color: $colorSecondaryLight;
}

.credit-card__notice {
  margin-top: 25px;
}
</style>
