<template>
  <div class="details">
    <div class="details__graphic">
      <slot name="graphic" />
    </div>
    <div class="details__description">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'TypeDetails' })
</script>

<style lang="scss" scoped>
.details {
  display: grid;
  grid-template-rows: 175px 1fr;
}

.details__graphic {
  border-top-right-radius: 5px;
  background: $colorFeatherFade;
  overflow: hidden;
}

.details__description {
  width: 100%;
  padding: 20px;
  display: grid;
  grid-auto-flow: row;
  row-gap: 20px;
}

.details__description h3 {
  @include typography(lg-1, mulish, bold);
}

.details__description p {
  @include typography(md, mulish, normal);
  color: $color90Black;
}

.details__description .input-output {
  display: grid;
  grid-template-columns: 50px auto;
  align-items: center
}

.details__description .input-output label {
  @include typography(md, mulish, bold);
}
</style>
