<template>
  <div class="pill">
    <div class="pill__text">
      Partner
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'PartnerPill' })
</script>

<style lang="scss" scoped>
.pill {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 4px;

  width: 43px;
  height: 16px;

  /* Overlay/Interactive */

  background: rgba(35, 89, 251, 0.16);
  border-radius: 4px;

  /* Inside auto layout */

  flex: none;
  order: 0;
  flex-grow: 0;
}

.pill__text {
  width: 35px;
  height: 12px;

  /* Regular/Body 25 */

  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  line-height: 12px;
  /* identical to box height, or 120% */

  text-align: center;
  letter-spacing: -0.02em;

  /* Interactive/Primary/Default */

  color: #2359FB;

  /* Inside auto layout */

  flex: none;
  order: 0;
  flex-grow: 0;
}
</style>
