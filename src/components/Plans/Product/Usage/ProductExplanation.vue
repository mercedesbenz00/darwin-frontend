<template>
  <div
    class="product-explanation"
    :class="{'product-explanation--open': open}"
  >
    <div
      class="product-explanation__header"
      data-role="button"
      @click="toggle"
    >
      <slot name="title" />
      <chevron-right-icon class="product-explanation__header__icon" />
    </div>
    <div
      ref="body"
      class="product-explanation__body"
    >
      <slot name="body" />
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'

import { ChevronRightIcon } from '@/assets/icons/V1'

@Component({ name: 'product-explanation', components: { ChevronRightIcon } })
export default class ProductExplanation extends Vue {
  open: boolean = false

  $refs!: {
    body?: HTMLDivElement
  }

  toggle (): void {
    this.open = !this.open

    const { body } = this.$refs

    if (!body) { return }

    // since height of the element is dynamic based on content and not known in
    // advance, we are forced to set maxHeight (to get an open-close transition)
    // programmatically this way
    if (this.open) {
      const children = Array.from(body.children)
      // note that, since we compute from actual current child heights, we do
      // not need to apply theme scaling
      const maxHeight = children.reduce((acc, el) => el.clientHeight + acc, 0)
      body.style.maxHeight = `${maxHeight}px`
    } else {
      body.style.maxHeight = '0'
    }
  }
}
</script>

<style lang="scss" scoped>
.product-explanation {
  @include col;

  row-gap: 20px;

  h3 {
    @include typography(md-1, mulish, bold);
    color: $color90Black;
  }

  p {
    @include typography(md, mulish);
    color: $colorDarkNight;
  }

  :deep(strong) {
    @include typography(md, mulish, bold);
  }
}

.product-explanation__header {
  display: grid;
  grid-auto-flow: column;
  justify-content: space-between;
  align-items: center;

  padding: 0 20px;
  margin-left: -20px;
  cursor: pointer;

  height: 40px;
  border-radius: 5px;
  background: transparent;
  transition: background-color .2s ease;
}

.product-explanation__header:hover {
  background: $colorAliceBlue;
}

.product-explanation__header__icon {
  color: $colorAliceNight;
  transform-origin: center;
  transform: rotate(0);
  transition: transform .2s ease;
}

.product-explanation--open .product-explanation__header .product-explanation__header__icon,
.product-explanation__header:hover .product-explanation__header__icon {
  transform: rotate(90deg);
}

.product-explanation__body {
  @include col;

  overflow: hidden;
  transform-origin: top;
  max-height: 0;
  transition: max-height 0.2s ease;

  // we cannot use row-gap here
  // p children need a padding because the compont, for smooth collapse/expand
  // transitioning, needs there to be no whitespace that is scaled at css level
  :deep(p) {
    padding-bottom: 18px;
  }
}
</style>
