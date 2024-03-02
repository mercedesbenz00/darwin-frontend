<template>
  <div
    v-tooltip="tooltip ? { content: tooltip, placement: 'bottom' } : undefined"
    class="gallery-context-menu__item"
    role="button"
    :class="classes"
    @click="onClick"
  >
    <div
      v-if="$slots.default || icon"
      class="gallery-context-menu__item__icon"
    >
      <slot v-if="$slots.default" />
      <img
        v-if="icon"
        :src="icon"
      >
    </div>
    <div
      v-if="label"
      class="gallery-context-menu__item__label"
    >
      {{ label }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'gallery-context-menu-item' })
export default class GalleryContextMenuItem extends Vue {
  @Prop({ required: true })
  label!: string

  @Prop({ required: false, default: null })
  color!: string | null

  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  @Prop({ required: false, default: null })
  icon!: string | null

  @Prop({ required: false, default: null })
  tooltip!: string | null

  get classes () {
    const classes = []
    if (this.color) { classes.push(`gallery-context-menu__item--${this.color}`) }
    if (this.disabled) { classes.push('gallery-context-menu__item--disabled') }
    return classes.join(' ')
  }

  onClick (event: MouseEvent) {
    if (this.disabled) { return }
    this.$emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
.gallery-context-menu__item {
  @include row--center;
  padding: 12px 10px;
  color: $color90Black;
  background: $colorWhite;

  transition: all .2s ease;
  transition-property: background-color;

  &:hover {
    background: $colorAliceBlue;
  }

  &:active {
    background: $colorAliceShade;
  }

  & > *:not(:first-child) {
    margin-left: 10px;
  }
}

.gallery-context-menu__item.gallery-context-menu__item--disabled {
  color: rgba($color90Black, 0.3);

  &:hover {
    background: transparent;
  }

  &:active {
    background: transparent;
  }

  img, svg {
    opacity: 0.4;
  }
}

.gallery-context-menu__item--pink {
  color: $colorPink;
}
.gallery-context-menu__item--pink.gallery-context-menu__item--disabled {
  color: #FF287564;
}

.gallery-context-menu__item__icon {
  display: flex;

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
}

.gallery-context-menu__item__label {
  @include typography(md-1, headlines, 500);
  text-align: center;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: $color90Black;
}
</style>
