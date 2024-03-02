<template>
  <ul class="shortcut">
    <li
      v-for="key in keys"
      :key="key"
    >
      <keycap
        :inverted="inverted"
        :size="size"
      >
        {{ key }}
      </keycap>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { Keycap } from '@/components/Common/Keycap'

import { ShortcutSize } from './types'
import { sizeValidator } from './validators'

export default defineComponent({
  name: 'Shortcut',
  components: { Keycap },
  props: {
    keys: {
      required: true,
      type: Array as () => string[]
    },
    size: {
      required: false,
      default: ShortcutSize.MEDIUM,
      type: String as () => ShortcutSize,
      validator: sizeValidator
    },
    inverted: {
      required: false,
      default: false,
      type: Boolean
    }
  }
})

</script>

<style lang="scss" scoped>
.shortcut {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;

  & > *:not(:last-child) {
    margin-right: 2px;
  }
}
</style>
