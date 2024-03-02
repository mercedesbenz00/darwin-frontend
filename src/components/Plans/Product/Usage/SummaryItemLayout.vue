<template>
  <div class="summary-item-layout">
    <div class="summary-item-layout__header">
      <header-4 v-if="$slots.title">
        <slot name="title" />
      </header-4>
      <slot name="title-aside" />
    </div>
    <slot name="bar" />
    <div class="summary-item-layout__footer">
      <slot name="footer-left" />
      <slot name="footer-right" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Header4 from '@/components/Common/Header4.vue'

/**
 * Defines common layout for the following components
 *
 * - `CreditSummaryItem`
 * - `StorageSummaryItem`
 */
export default defineComponent({ name: 'SummaryItemLayout', components: { Header4 } })
</script>

<style lang="scss" scoped>
.summary-item-layout {
  display: grid;
  grid-auto-flow: row;
  row-gap: 10px;
}

.summary-item-layout__header,
.summary-item-layout__footer {
  @include row--distributed;
  align-items: center;
}
</style>
