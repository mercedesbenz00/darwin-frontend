<template>
  <div class="hotkey-display">
    <div
      v-for="(hotkey, index) of keys"
      :key="index"
      class="hotkey-display__key"
    >
      <span
        v-if="index > 0"
        class="hotkey-display__key_plus"
      >+</span>
      <span class="hotkey-display__key_cell">{{ checkCMD(hotkey) }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { onMacOS } from '@/utils'

@Component({ name: 'hotkey-display' })
export default class HotkeyDisplay extends Vue {
  @Prop({ required: true })
  keys!: string[]

  checkCMD (key: string): string {
    if (key === 'CMD') {
      return onMacOS() ? '⌘' : 'CTRL'
    }
    return key
  }
}
</script>

<style lang="scss" scoped>
.hotkey-display {
  @include row;
}

.hotkey-display__key {
  @include row;
  align-items: center;
}

.hotkey-display__key_plus {
  @include typography(md-1, default, bold);
  color: $colorAliceNight;
  margin: 0 3px;
}

.hotkey-display__key_cell {
  @include typography(md, default, bold);
  color: #607C95;
  padding: 2px 5px;
  background: $colorAliceBlue;
  border: 1px solid $colorAliceShadow;
  border-radius: 5px;
}
</style>
