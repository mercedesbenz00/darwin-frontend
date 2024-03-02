<template>
  <div
    v-if="hotkey"
    class="hotkey-display"
  >
    {{ hotkey }}
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({ name: 'hotkey-display' })
export default class HotkeyDisplay extends Vue {
  @Prop({ type: String, default: null })
  hotkey!: string | null
}
</script>

<style lang="scss" scoped>
.hotkey-display {
  @include row--center;
  @include typography(md, default, bold);
  padding: 2px 5px;
  background: $colorAliceBlue;
  color: #607C95;
  border: 1px solid $colorAliceShadow;
  border-radius: 5px;
}
</style>
