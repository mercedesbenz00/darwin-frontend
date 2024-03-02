<template>
  <router-link
    v-if="!!to"
    class="card-button"
    :class="disabled && 'card-button--disabled'"
    :to="to"
    @click.native.stop
  >
    <slot />
  </router-link>
  <div
    v-else
    class="card-button"
    :class="disabled && 'card-button--disabled'"
    @click.stop.prevent="$emit('click')"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

/**
 * Renders a button on top of a card component.
 *
 * The button can be rendered as a router-link, or as a div which emits the
 * click event.
 *
 * The component supports a purely presentational `disabled` prop, in that it
 * will render differently, but it will still be interactive and emit `click.`
 */
@Component({ name: 'card-button' })
export default class CardButton extends Vue {
  @Prop({ default: null, type: [String, Object] })
  to!: string | Location | null

  @Prop({ type: Boolean, default: false })
  disabled!: boolean
}
</script>

<style lang="scss" scoped>
.card-button {
  width: 80px;
  height: 30px;
  border: 1px solid $colorWhite;
  border-radius: 3px;
  margin-top: 4px;
  color: $colorWhite;
  @include row--center;
  @include typography(md-1);
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

.card-button--disabled {
  opacity: 0.7;

  &:hover,
  &:active {
    background: transparent;
  }
}
</style>
