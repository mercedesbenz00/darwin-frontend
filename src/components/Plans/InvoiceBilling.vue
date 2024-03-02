<template>
  <div class="invoice-billing">
    <div class="invoice-billing__header">
      Invoice Billing
    </div>
    <div class="invoice-billing__content">
      Invoice billing is inactive
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'InvoiceBilling' })
</script>

<style lang="scss" scoped>
.invoice-billing__header {
  @include typography(lg-1, headlines, bold);
  margin-bottom: 20px;
  color: $colorSecondaryDark1;
}

.invoice-billing__content {
  @include typography(md);
  color: $colorSecondaryDark1;
}
</style>
