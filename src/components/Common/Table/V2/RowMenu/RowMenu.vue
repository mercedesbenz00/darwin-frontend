<template>
  <button
    :id="id"
    class="row-menu"
    :class="`row-menu--${isItem ? 'item' : 'header'}`"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <icon-mono-dots-vertical v-if="isItem" />
    <icon-mono-plus v-else />
  </button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { IconMonoDotsVertical, IconMonoPlus } from '@/assets/icons/V2/Mono'

/**
 * @Component RowMenu
 * ~ Will show a configure able menu button at the end of every table item and header row
 * @param {string} tableId
 * Uses table id to identify row menu when more then 1 table is on the same page
 * @param {string} isItem
 * toggles icon and class for specific use-case
 * */
export default defineComponent({
  name: 'RowMenu',
  components: { IconMonoDotsVertical, IconMonoPlus },
  props: {
    tableId: {
      type: String,
      required: true
    },
    isItem: {
      type: Boolean,
      default: true
    },
    /*
    * Used for identification later inside id, since row-menu-<tableId> is not unique inside
    * the table
    * */
    row: {
      type: Number,
      required: true
    }
  },
  setup (props) {
    const id = computed(() => `row-menu-${props.tableId}-${props.row}`)

    return { id }
  }
})
</script>

<style lang="scss" scoped>
$rowWidth: 40px;

.row-menu {
  transition: background-color 175ms ease;

  position: sticky;
  top: 0;
  right: 0;
  z-index: 1001;

  display: flex;
  align-items: center;
  justify-content: center;

  width: $rowWidth;

  margin: 0 0 0 0.25px;
  padding: 0;

  transition: all 175ms ease;

  &:hover {
    color: $colorContentSecondary;
    background: $colorSurfaceElevate;

    :deep(circle) {
      transition: all 175ms ease;

      fill: $colorContentSecondary;
    }

    :deep(path) {
      transition: all 175ms ease;

      stroke: $colorContentSecondary;
    }
  }

  &--item {
    background: transparent;
    height: 40px;
  }

  &--header {
    background: $colorNeutralsLightWhite;
    height: 32px;
    border-bottom: none;
  }

  & > :deep(svg) {
    pointer-events: none;
  }
}
</style>
