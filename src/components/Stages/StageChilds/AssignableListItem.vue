<template>
  <div
    class="assignable-list-item"
    :class="{ 'assignable-list-item--selected': selected }"
    role="button"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot name="icon" />
    <h3 class="assignable-list-item__label">
      <slot name="label" />
    </h3>
    <slot name="addon" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AssignableListItem',
  props: {
    selected: { type: Boolean, default: false, required: false }
  }
})
</script>

<style lang="scss" scoped>
.assignable-list-item {
  padding: 0.5px 2px;
  cursor: pointer;
  transition: background 200ms ease;
  display: grid;
  align-items: center;
  grid-gap: 6px;
  grid-template-columns: 20px 1fr min-content;
  padding: 5px 8px 5px 8px;
  border-radius: 8px;

  .assignable-list-item__label {
    transition: color 200ms ease;
    user-select: none;
    @include typography(md, inter, 500);
    color: $colorNeutralsLight800;
  }

  &--selected {
    background: $colorSemanticLightAction100;

    .assignable-list-item__label {
      color: $colorSemanticLightAction500;

      &:last-child {
        color: $colorSemanticLightAction500;
      }
    }
  }
}
</style>
