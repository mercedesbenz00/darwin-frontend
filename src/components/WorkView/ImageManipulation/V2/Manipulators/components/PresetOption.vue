<template>
  <div class="preset-option">
    <span>{{ option.label }}</span>
    <div
      v-if="!isSelected"
      class="preset-option__icons"
    >
      <template v-if="hotkeys.length === 2">
        <hotkey-display
          v-for="(hotkey, index) of hotkeys"
          :key="index"
          :hotkey="hotkey"
        />
      </template>

      <preset-menu
        class="preset-overlay__more"
        @apply-changes="$emit('apply-changes')"
        @delete="$emit('delete')"
        @edit="$emit('edit')"
      >
        <more-vertical-icon class="preset-overlay__icon" />
      </preset-menu>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { MoreVerticalIcon } from '@/assets/icons/V1'
import HotkeyDisplay from '@/components/Common/HotkeyDisplay.vue'

import PresetMenu from './PresetMenu.vue'
import { PresetOptionType } from './types'

@Component({
  name: 'preset-option',
  components: { HotkeyDisplay, MoreVerticalIcon, PresetMenu }
})
export default class PresetOption extends Vue {
  @Prop({ required: true })
  option!: PresetOptionType

  @Prop({ required: false, default: false, type: Boolean })
  isSelected!: boolean

  get hotkeys (): string[] {
    const { hotKey } = this.option
    return hotKey?.keys || []
  }
}
</script>

<style lang="scss" scoped>
.preset-option {
  @include row;
  align-items: center;
}
.preset-option__icons {
  margin-left: auto;
  display: flex;
  gap: 3px;
}
.preset-overlay__more {
  @include row--center;
  @include typography(md, default, bold);
  text-align: center;
}
.preset-overlay__icon {
  height: 16px;
  vertical-align: middle;
  margin-top: 2px;
}
</style>
