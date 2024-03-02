<template>
  <simple-labeled-value>
    <template #label>
      Bonus:
    </template>
    <template #value>
      {{ info.customer_subscription.annotation_credits_bonus }}
    </template>
    />
  </simple-labeled-value>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { BillingInfoPayload } from '@/store/modules/billing/types'

import SimpleLabeledValue from './SimpleLabeledValue.vue'

@Component({
  name: 'credit-bonus-hours', components: { SimpleLabeledValue }
})
export default class CreditBonusHours extends Vue {
  @Prop({ required: true, type: Object as () => BillingInfoPayload })
  info!: BillingInfoPayload
}
</script>
