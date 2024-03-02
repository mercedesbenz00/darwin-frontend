<template>
  <button
    class="tab"
    :class="`tab--${variant}`"
    v-bind="$attrs"
  >
    <div class="tab-content">
      <div
        class="tab-icon__wrapper"
        v-if="!!iconName"
      >
        <component :is="iconName" />
      </div>
      <p
        class="tab-label"
        :class="{ ['tab-label--active']: active }"
        v-if="!!label"
      >
        {{ label }}
      </p>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { IconDuotoneViewGrid } from '@/assets/icons/V2/Duotone'
import { IconMonoIdle, IconMonoViewList } from '@/assets/icons/V2/Mono'
import { SegmentedControlVariant } from '@/components/Common/SegmentedControl/types'

/**
 * @Component Tab
 * ~ Individual tab for segemented control component.
 * @param {string} id Used for identification when clicking or doing anything else
 * @param {string} label Label to display on tab
 * @param {string} iconName Icon name used to display icon on tab. USING NEW V2 DESIGN NAMING HERE
 * @param {string} active Indicator to check if current tab is active
 * @param {string} variant Checks if the tab should me (atm.) SMALL or LARGE
 * */

export default defineComponent({
  name: 'Tab',
  components: { IconMonoIdle, IconMonoViewList, IconDuotoneViewGrid },
  props: {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: null
    },
    iconName: {
      type: String,
      default: null
    },
    active: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: SegmentedControlVariant.SMALL
    }
  }
})
</script>

<style lang="scss" scoped>
.tab {
  display: flex;
  align-items: center;
  justify-content: center;

  background: transparent;
  z-index: 1;

  border-radius: 5px;

  cursor: pointer;

  &--small {
    height: 26px;
  }

  &--large {
    height: 28px;
  }
}

.tab-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
}

.tab-icon__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.tab-label {
  transition: color 175ms ease;

  @include typography(md, inter, 500);
  color: $colorContentTertiary;

  &--active {
    color: $colorContentEmphasis;
  }
}
</style>
