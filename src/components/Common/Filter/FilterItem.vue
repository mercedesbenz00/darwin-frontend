<template>
  <div
    class="filter-item"
    :class="{
      [`filter-item--${status}`]: true,
    }"
    @click="onClick"
  >
    <div
      v-if="$slots.icon"
      class="filter-item__icon"
    >
      <slot name="icon" />
    </div>
    <div
      v-if="$slots.label"
      class="filter-item__label"
    >
      <slot name="label" />
    </div>

    <div
      v-if="$slots.count"
      class="filter-item__count"
    >
      <slot name="count" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import SvgOverlay from '@/components/Common/SVGOverlay.vue'
import { TriToggleStatus } from '@/utils'

@Component({ name: 'filter-item', components: { SvgOverlay } })
export default class FilterItem extends Vue {
  @Prop({
    type: String as () => TriToggleStatus,
    default: 'none'
  })
  status!: TriToggleStatus

  onClick (evt: MouseEvent) {
    if (evt.shiftKey) {
      this.$emit('shift-click')
    } else {
      this.$emit('click')
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-item {
  @include row--center;
  @include noSelect;
  width: 100%;
  cursor: pointer;
  border-radius: 13px;
  padding: 2px 3px;
  transition: background-color .2s;

  &:hover, &:active {
    border: 1px solid $colorAliceShade;
    background-color: $colorAliceShade;
    transition: none;
  }
}

.filter-item--none {
  border: 1px solid $colorAliceBlue;
  background-color: transparent;

  &:hover, &:active {
    border: 1px solid $colorAliceShade;
    background-color: $colorAliceShade;
  }
}

.filter-item--positive {
  border: 1px solid $colorAliceNight;
  background-color: $colorAliceShadow;

  &:hover, &:active {
    border: 1px solid $colorAliceNight;
    background-color: $colorAliceShadow;
  }
}

.filter-item--negative {
  border: 1px solid $colorCrimson;
  background-color: $colorCrimsonDawn;

  &:hover, &:active {
    border: 1px solid $colorCrimson;
    background-color: $colorCrimsonDawn;
  }
}

.filter-item__icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  object-fit: contain;

  &:deep(img) {
    height: 100%;
    width: 100%;
  }
}

.filter-item__label {
  flex: 1;
  @include typography(md, default, normal);
  text-align: left;
  color: $colorSecondaryDark;
  white-space: nowrap;
}

.filter-item__count {
  margin-right: 15px;
  @include typography(sm, default, bold);
  text-align: right;
  color: $colorSecondaryLight;
}
</style>
