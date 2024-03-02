<template>
  <div class="storage-bar">
    <div
      class="storage-bar__bar"
      :class="{
        'storage-bar__bar--low': percentage >= 80,
        'storage-bar__bar--critical': percentage >= 100
      }"
      :style="{width: `${percentage}%`}"
    />
    <div class="storage-bar__used">
      {{ usedFormatted }} managed files
    </div>

    <div
      v-if="billingInfo.clients.length > 0"
      class="storage-bar__used-clients"
    >
      {{ usedByClientsFormatted }} files in clients
    </div>

    <div class="storage-bar__total">
      of {{ totalFormatted }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { BillingInfoPayload, CustomerSubscriptionPayload } from '@/store/modules/billing/types'
import { formatInteger } from '@/utils'

@Component({ name: 'storage-bar' })
export default class StorageBar extends Vue {
  @Prop({ required: true, type: Object as () => BillingInfoPayload })
  billingInfo!: BillingInfoPayload

  get subscription (): CustomerSubscriptionPayload {
    return this.billingInfo.customer_subscription
  }

  get used (): number {
    return this.subscription.storage_used
  }

  get usedFormatted (): string {
    return formatInteger(this.used)
  }

  get usedByClients (): number {
    return this.billingInfo.clients
      .map(c => c.customer_subscription.storage_used)
      .reduce((acc, b) => acc + b, 0)
  }

  get usedByClientsFormatted (): string {
    return formatInteger(this.usedByClients)
  }

  get total (): number {
    return this.subscription.storage_standard_max_in_period + this.subscription.storage_extra
  }

  get totalFormatted (): string {
    return formatInteger(this.total)
  }

  get percentage (): number {
    const { total, used, usedByClients } = this
    return Math.round((used + usedByClients) / total * 100)
  }
}
</script>

<style lang="scss" scoped>
.storage-bar {
  width: 100%;
  height: 52px;
  position: relative;
  border-radius: 26px;
  border: 6px solid $colorAliceShadow;
  background: $colorAliceNight;
  box-shadow: inset 0px 5px 10px rgba(88, 116, 141, 0.5);
  overflow: hidden;

  display: grid;
  grid-template-columns: auto auto auto;
  justify-content: space-between;
  align-items: center;
  column-gap: 12px;
}

.storage-bar__used,
.storage-bar__used-clients,
.storage-bar__total {
  grid-row: 1 / 2;

  color: white;
  @include ellipsis(1, md-1);
  @include typography(md-1, mulish, bold);
}

.storage-bar__used {
  padding-left: 12px;
  grid-column: 1 / 2;
}

.storage-bar__used-clients {
  grid-column: 2 / 3;
}

.storage-bar__total {
  padding-right: 12px;
  grid-column: 3 / 4;
}

.storage-bar__bar {
  grid-row: 1 / 2;
  grid-column: 1 / 4;

  height: 100%;

  background: $colorFeatherLight;
  box-shadow: inset 0px -4px 10px #3ABA9B, inset 0px 5px 10px #B5FDF4;

  &--low {
    background: $colorEgg;
    box-shadow: inset 0px -4px 10px #BAAD3A, inset 0px 5px 10px #FDE0B5;
  }

  &--critical {
    background: $colorCrimsonFade;
    box-shadow: inset 0px -4px 10px #BA3A3A, inset 0px 5px 10px #FDB5B5;
  }
}
</style>
