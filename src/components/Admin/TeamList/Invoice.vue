<template>
  <div
    v-if="status"
    class="invoice"
  >
    <v-popover trigger="hover">
      <a
        class="invoice__link"
        :class="`invoice__link--${status}`"
        :href="pdf"
        target="_blank"
      >{{ amount }}</a>
      <template slot="popover">
        <div class="invoice__amount invoice__info-item">
          <div
            class="invoice__amount__icon"
            :class="`invoice__amount__icon--${status}`"
          >
            {{ status }}
          </div>
          <div class="invoice__amount__value">
            {{ amount }}
          </div>
        </div>
        <div class="invoice__info-item">
          <strong>Created:</strong>
          <span>{{ creationDate }}</span>
        </div>
        <div class="invoice__info-item">
          <strong>Due:</strong>
          <span>{{ dueDate }}</span>
        </div>
        <div class="invoice__info-item">
          Click to download pdf
        </div>
      </template>
    </v-popover>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TeamPayload } from '@/store/modules/admin/types'
import { formatSubCurrency, formatUnixDate } from '@/utils'

@Component({ name: 'invoice' })
export default class Invoice extends Vue {
  @Prop({ required: true })
  team!: TeamPayload

  get amount (): string {
    return formatSubCurrency(this.team.last_invoice_amount)
  }

  get status (): TeamPayload['last_invoice_status'] {
    return this.team.last_invoice_status
  }

  get pdf (): TeamPayload['last_invoice_pdf'] {
    return this.team.last_invoice_pdf
  }

  get creationDate (): string {
    if (!this.team.last_invoice_created) { return 'N/A' }
    return formatUnixDate(this.team.last_invoice_created, 'MMMM Do, YYYY')
  }

  get dueDate (): string {
    if (!this.team.last_invoice_due_date) { return 'N/A' }
    return formatUnixDate(this.team.last_invoice_due_date, 'MMMM Do, YYYY')
  }
}
</script>
<style lang="scss" scoped>
.invoice {
  @include row--right;
  width: 100%;
}

.invoice__info {
  margin-right: 10px;
}

.invoice-invoice__info--critical {
  font-weight: bold;
  color: $colorPink;
}

.invoice__link {
  border: none;
  padding: 5px;
  color: $colorAssignedBlue;
  padding: 0;
  font-weight: bold;
}

.invoice__link--paid {
  color: $colorPrimaryDark;
}

.invoice__link--open {
  color: $colorEgg;
}

.invoice__link--uncollectible {
  color: $colorPink;
}

.invoice__info-item {
  @include row--distributed;
  align-items: center;
  margin-bottom: 10px;
}

.invoice__info-item strong {
  font-weight: 900;
  margin-right: 20px;
}

.invoice__amount__icon {
  padding: 5px;
  margin-right: 10px;
  border-radius: 3px;
  background: $colorAssignedBlue;
  color: $colorSecondaryDark;
}

.invoice__amount__icon--paid {
  background: $colorPrimaryDark;
}

.invoice__amount__icon--open {
  background: $colorEgg;
}

.invoice__amount__icon--uncollectible {
  background: $colorPink;
}

</style>
