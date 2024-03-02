<template>
  <div class="product">
    <div class="product__billed">
      <slot name="billed" />
    </div>
    <button
      :disabled="disabled"
      class="product__edit-button"
      @click="$emit('edit')"
    >
      <plus-icon class="product__edit-button__icon" />
      <span class="product__edit-button__text">Edit</span>
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { PlusIcon } from '@/assets/icons/V1'

@Component({ name: 'product-layout', components: { PlusIcon } })
export default class ProductLayout extends Vue {
  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean
}
</script>

<style lang="scss" scoped>
.product {
  display: grid;
  grid-template-columns: 130px 130px;
  align-items: center;
  justify-content: space-evenly;
  grid-gap: 20px;
}

.product__billed .product-section {
  color: $colorBlack;
}

.product__edit-button {
  height: 130px;
  border-radius: 10px;
  background-color: $colorAliceBlue;

  transition: background-color .2s ease;

  color: $colorAliceNight;

  display: grid;
  grid-template-rows: auto auto;
  grid-gap: 10px;

  justify-items: center;

  &__icon {
    align-self: end;
  }

  &__text {
    align-self: start;
    @include typography(xl, headlines, bold)
  }

  &:hover {
    background-color: $colorAliceShadow;
  }
}

</style>
