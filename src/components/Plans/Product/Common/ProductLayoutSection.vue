<template>
  <div class="product-section">
    <div class="product-section__text">
      {{ text }}
    </div>
    <div class="product-section__subtext">
      {{ subtext }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({ name: 'product-layout-section' })
export default class ProductLayoutSection extends Vue {
  @Prop({ required: true, type: String })
  text!: string

  @Prop({ required: true, type: String })
  subtext!: string
}
</script>

<style lang="scss" scoped>
.product-section {
  color: $colorBlack;

  display: grid;
  grid-template-rows: auto auto;

  justify-items: center;

  &__text {
    align-self: end;
    @include typography(xxl-2, headlines, bold);
    // Fixes line height mismatch introduced by typography.
    // Allows amount to align with unit on bottom
    line-height: 100%;

    display: grid;
  }

  &__subtext {
    align-self: start;
    @include typography(md-1, headlines, bold);
  }
}
</style>
