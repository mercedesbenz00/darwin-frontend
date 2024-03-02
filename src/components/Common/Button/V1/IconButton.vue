<template>
  <component
    :is="tag"
    class="icon__button"
    v-bind="tagProps"
    v-on="$listeners"
  >
    <slot />
  </component>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'icon-button' })
export default class IconButton extends Vue {
  @Prop({ default: null })
  to!: string | null

  get tag () {
    return this.to ? 'router-link' : 'button'
  }

  get tagProps () {
    return this.tag === 'router-link'
      ? { to: this.to }
      : {}
  }
}
</script>

<style lang="scss" scoped>
.icon__button {
  @include row--center;
  width: 25px;
  min-width: 25px;
  height: 25px;
  outline: none;
  border: none;
  padding: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;

  &:hover {
    background: $colorAliceShade;
  }

  svg {
    width: 15px;
    height: 13px;
  }
}
</style>
