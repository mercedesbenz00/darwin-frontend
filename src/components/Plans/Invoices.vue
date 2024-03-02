<template>
  <div class="invoices">
    <div class="invoices__header">
      Payments
    </div>
    <v-table
      v-if="visibleInvoices.length > 0"
      no-pagination
      striped
      :data="visibleInvoices"
      :columns="[{
        key: 'amount',
        class: 'invoices__table__row__amount',
      }, {
        key: 'date',
        class: 'invoices__table__row__date',
      }, {
        key: 'status',
        class: 'invoices__table__row__status',
      }, {
        key: 'receipt',
        class: 'invoices__table__row__receipt-link',
      }]"
    >
      <template #amount="{ row }">
        {{ formatSubCurrency(row) }}
      </template>
      <template #date="{ row }">
        {{ formatDate(row) }}
      </template>
      <template #status="{ row }">
        {{ formatStatus(row) }}
      </template>
      <template #receipt="{ row }">
        <a
          v-if="row.receipt_url"
          :href="row.receipt_url"
          target="_blank"
        >Receipt</a>
        <span v-else>N/A</span>
      </template>
    </v-table>
    <div
      v-else
      class="invoices__empty"
    >
      No payments made yet
    </div>
  </div>
</template>

<script lang="ts">
import { startCase } from 'lodash'
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { Table } from '@/components/Common/Table/V1'
import { BillingInfoPayload, InvoicePayload } from '@/store/modules/billing/types'
import { formatUnixDate, formatSubCurrency } from '@/utils'

@Component({
  name: 'invoices',
  components: {
    'v-table': Table
  }
})
export default class Invoices extends Vue {
  @State(state => state.billing.invoices)
  invoices!: InvoicePayload[]

  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  formatSubCurrency (invoice: InvoicePayload): string {
    return formatSubCurrency(invoice.amount_due, invoice.currency)
  }

  formatDate (invoice: InvoicePayload): string | undefined {
    return formatUnixDate(invoice.due_date
      ? invoice.due_date
      : invoice.created, 'MMMM Do, YYYY')
  }

  formatStatus (invoice: InvoicePayload): string {
    return startCase(invoice.status)
  }

  get visibleInvoices () {
    return this.invoices.filter(i => i.receipt_url)
  }
}
</script>

<style lang="scss" scoped>
.invoices {
  width: 100%;
}

.invoices__header {
  @include typography(lg-1, headlines, bold);
  color: $colorSecondaryDark1;
  margin-bottom: 25px;
}

.invoices__empty {
  @include typography(md);
  font-style: italic;
  color: $colorSecondaryDark1;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.invoices__table__row__amount {
  color: $colorSecondaryDark3;
  @include typography(md-1, default);
}

.invoices__table__row__date,
.invoices__table__row__status {
  color: $colorSecondaryLight;
  @include typography(md-1, default);
}

.invoices__table__row__receipt-link {
  text-align: right;
}

.invoices__table__row__download-link,
.invoices__table__row__receipt-link {
  a {
    @include typography(md-1);
    color: $colorPrimaryDark;
  }
}
</style>
