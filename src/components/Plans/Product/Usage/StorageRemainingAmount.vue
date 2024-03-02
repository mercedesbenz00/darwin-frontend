<template>
  <simple-labeled-value>
    <template #label>
      Remaining:
    </template>
    <template #value>
      {{ remaining }}
    </template>
    />
  </simple-labeled-value>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { BillingInfoPayload } from '@/store/modules/billing/types'

import SimpleLabeledValue from './SimpleLabeledValue.vue'

@Component({
  name: 'storage-remaining-amount', components: { SimpleLabeledValue }
})
export default class StorageRemainingAmount extends Vue {
  @Prop({ required: true, type: Object as () => BillingInfoPayload })
  info!: BillingInfoPayload

  get remaining (): number {
    const remaining = this.info.customer_subscription.storage_standard_max_in_period +
      this.info.customer_subscription.storage_extra -
      this.info.customer_subscription.storage_used
    return Math.max(remaining, 0)
  }
}
</script>
