<template>
  <div :class="className">
    <div
      v-if="$slots['icon']"
      class="popup-menu-item__icon"
    >
      <slot name="icon" />
    </div>
    <div class="popup-menu-item__label">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'popup-menu-item' })
export default class PopupMenuItem extends Vue {
  @Prop({
    required: false,
    default: 'standard',
    validator: (val) => ['standard', 'crimson'].includes(val)
  })
  theme!: 'standard' | 'crimson'

  @Prop({ required: false, type: Boolean, default: false })
  disabled!: boolean

  get className () {
    const classes = [
      'popup-menu-item',
      `popup-menu-item--${this.theme}`
    ]
    if (this.disabled) {
      classes.push('popup-menu-item--disabled')
    }

    return classes.join(' ')
  }
}
</script>

<style lang="scss" scoped>
.popup-menu-item {
  @include row;
  align-items: center;
  width: 100%;
  min-width: 120px;
  column-gap: 10px;

  transition: all 0.05s ease-in-out;

  padding: 0 10px;
  height: 28px;

  border-radius: 5px;
  cursor: pointer;
  background: transparent;
}

.popup-menu-item--disabled {
  opacity: 0.3;
}

.popup-menu-item--standard {
  color: $color90Black;

  &:not(.popup-menu-item--disabled) {
    &:hover,
    &:active {
      background: $colorAliceShade;
    }
  }
}

.popup-menu-item--crimson {
  color: $colorCrimson;

  &:not(.popup-menu-item--disabled) {
    &:hover,
    &:active {
      background: $colorCrimsonFade;
    }
  }
}

.popup-menu-item__icon {
  @include row--center;
  height: 100%;

  :deep(& >) {
    height: 100%;
  }
}

.popup-menu-item__label {
  @include typography(md-1, inter);
  font-weight: 400;
  text-align: left;
}
</style>
