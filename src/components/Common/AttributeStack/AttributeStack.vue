<template>
  <div class="attribute-stack">
    <h3 class="attribute-stack__label attribute-stack__label--primary">
      <slot name="primary-attribute">
        Primary
      </slot>
    </h3>
    <h3 class="attribute-stack__label attribute-stack__label--secondary">
      <slot name="secondary-attribute">
        Secondary
      </slot>
    </h3>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'

export default defineComponent({ name: 'AttributeStack' })
</script>

<style lang='scss' scoped>
.attribute-stack {
  @include col--center;
  background-color: $colorSurfaceElevate;
  border-radius: 4px;
  padding: 4px;
}

.attribute-stack__label {
  &--primary {
    @include typography(md, inter, 500);
    color: $colorContentDefault;
  }

  &--secondary {
    @include typography(sm, inter, 500);
    color: $colorContentSecondary;
  }
}
</style>
