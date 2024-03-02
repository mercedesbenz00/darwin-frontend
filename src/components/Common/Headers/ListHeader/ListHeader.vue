<template>
  <button
    class="list-header"
    :class="`list-header--${variant} list-header--${size}`"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <p class="list-header__label">
      {{ label }}
    </p>
    <div class="list-header-icon__wrapper">
      <slot />
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from 'vue'

import { ListHeaderSize, ListHeaderVariant } from './types'

/**
 * @Component ListHeader
 * ~ It's a ListHeader...
 * @param {string} size Changes appearance/spacing depending on what size you'll pass
 * */

export default defineComponent({
  name: 'ListHeader',
  components: {},
  props: {
    size: {
      default: ListHeaderSize.SM,
      type: String
    },
    variant: {
      type: String,
      default: ListHeaderVariant.TRANSPARENT
    },
    label: {
      type: String,
      default: 'ListHeader'
    }
  },
  setup (props, context: SetupContext) {
    return {
      props,
      context
    }
  }
})
</script>

<style lang="scss" scoped>
.list-header {
  transition: background-color 125ms ease;

  display: inline-flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  height: auto;

  margin: 0;

  &--small {
    padding: 2px 10px 2px 12px;
  }

  &--medium {
    padding: 6px 10px 6px 12px;
  }

  &--large {
    padding: 8px 10px 8px 12px;
  }

  &--transparent {
    background: transparent;

    &:hover {
      background: $colorOverlayHover;

      &:active {
        background: $colorOverlayPressed;
      }
    }
  }

  &--elevate {
    background: $colorStrokeElevate;
  }
}

.list-header__label {
  @include typography(md-1, inter, 500);
  color: $colorContentSecondary;
  text-align: left;
  height: 20px;
}

.list-header-icon__wrapper {
  display: flex;
  align-items: center;
  width: fit-content;
  height: 20px;
}
</style>
