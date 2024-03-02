<template>
  <router-link
    v-if="!!to"
    class="list-item-button"
    :class="disabled && 'list-item-button--disabled'"
    :to="to"
    @click.native.stop
  >
    <slot />
  </router-link>
  <div
    v-else
    class="list-item-button"
    :class="disabled && 'list-item-button--disabled'"
    @click.stop.prevent="$emit('click')"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Location } from 'vue-router'

/**
 * Renders a button on top of a list item component.
 *
 * The button can be rendered as a router-link, or as a div which emits the
 * click event.
 *
 * The component supports a purely presentational `disabled` prop, in that it
 * will render differently, but it will still be interactive and emit `click.`
 */
@Component({ name: 'list-item-button' })
export default class ListItemButton extends Vue {
  @Prop({ required: false, default: null })
  to!: string | Location | null

  @Prop({ required: false, type: Boolean, default: false })
  disabled!: boolean
}
</script>

<style lang="scss" scoped>
.list-item-button {
  width: 58px;
  height: 28px;
  border: 1px solid $colorWhite;
  border-radius: 3px;
  color: $colorWhite;
  @include row--center;
  @include typography(xs, default, bold);
  text-align: center;
  letter-spacing: 0.5px;
  opacity: 1;
  cursor: pointer;
  z-index: 999;
  text-transform: uppercase;
  transition: all .2s;

  &:hover,
  &:active {
    background: rgba(255, 255, 255, .25);
  }
}

.list-item-button--disabled {
  opacity: 0.7;

  &:hover,
  &:active {
    background: transparent;
  }
}
</style>
