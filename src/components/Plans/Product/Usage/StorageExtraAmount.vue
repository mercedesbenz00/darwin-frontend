<template>
  <simple-labeled-value>
    <template #label>
      Extra:
    </template>
    <template #value>
      {{ info.customer_subscription.storage_extra }}
    </template>
    />
  </simple-labeled-value>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { BillingInfoPayload } from '@/store/modules/billing/types'

import SimpleLabeledValue from './SimpleLabeledValue.vue'

@Component({
  name: 'storage-extra-amount', components: { SimpleLabeledValue }
})
export default class StorageExtraAmount extends Vue {
  @Prop({ required: true, type: Object as () => BillingInfoPayload })
  info!: BillingInfoPayload
}
</script>
