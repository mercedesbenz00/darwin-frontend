<template>
  <div class="hotkey-input">
    <label class="hotkey-input__label">Hotkey</label>
    <div class="hotkey-input__box">
      <div
        class="hotkey-input__control hotkey-input__control--disabled"
      >
        <div
          v-tooltip="clickerSpecialTooltip"
          class="hotkey-input__clicker"
        >
          <span class="hotkey-special-text">Tab</span>
        </div>
      </div>

      <div
        class="hotkey-input__control"
        :class="{
          'hotkey-input__control--active': isAddingNumberHotkey
        }"
      >
        <div
          v-tooltip="clickerNumberTooltip"
          class="hotkey-input__clicker"
          @click="enableNumberHotkeyListener"
        >
          <more-horizontal-icon v-if="!numberHotKey || isAddingNumberHotkey" />
          <span v-else>{{ numberHotKey }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { MoreHorizontalIcon } from '@/assets/icons/V1'
import { HotkeyString } from '@/components/WorkView/HotkeyInfo/types'

@Component({
  name: 'hotkey-input',
  components: { MoreHorizontalIcon }
})
export default class HotkeyInput extends Vue {
  @Prop({ required: false, default: null })
  hotkey!: HotkeyString | null

  isAddingNumberHotkey: boolean = false

  get speicalHotKey (): string | null {
    if (this.hotkey && this.hotkey.keys && this.hotkey.keys.length) {
      return this.hotkey.keys[0]
    }
    return null
  }

  get numberHotKey (): string | null {
    if (this.hotkey && this.hotkey.keys && this.hotkey.keys.length > 1) {
      return this.hotkey.keys[1]
    }
    return null
  }

  get clickerNumberTooltip (): { content: string } {
    return {
      content: 'Press a key between 1 and 9 to select this'
    }
  }

  get clickerSpecialTooltip (): { content: string } {
    return {
      content: 'You can not input other special key'
    }
  }

  beforeDestroy (): void {
    this.disableNumberHotkeyListener()
  }

  enableNumberHotkeyListener (): void {
    this.isAddingNumberHotkey = true
    document.addEventListener('keydown', this.onNumberKeydown)
  }

  disableNumberHotkeyListener (): void {
    this.isAddingNumberHotkey = false
    document.removeEventListener('keydown', this.onNumberKeydown)
  }

  onNumberKeydown (event: KeyboardEvent): void {
    event.preventDefault()
    event.stopPropagation()

    if (event.key === 'Escape') {
      this.disableNumberHotkeyListener()
      return
    }

    // Instead of keyCode which is deprecated
    if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
      this.$store.dispatch('toast/notify'
        , { content: 'Type a number between 1 and 9 to set a hotkey' })
      return
    }

    const newHotkey: HotkeyString = this.hotkey ? { ...this.hotkey } : { keys: [] }

    if (newHotkey.keys.length > 1) {
      newHotkey.keys[1] = event.key
    } else {
      newHotkey.keys = [newHotkey.keys.length ? newHotkey.keys[0] : '', event.key]
    }
    this.$emit('update:hotkey', newHotkey)
    this.disableNumberHotkeyListener()
  }
}
</script>

<style lang="scss" scoped>
.hotkey-input {
  align-items: center;
  width:45px;
  margin-top: -1.4rem;
  flex-shrink: 0;
}

.hotkey-input__box {
  display: -webkit-box;
  gap: 8px;
}

.hotkey-input__control {
  position: relative;
  width: 39px;
  height: 36px;
  background: $colorAliceBlue;
  border: 2px solid $colorAliceShadow;
  border-radius: $border-radius-default;
  margin-top: 0.5rem;
}

.hotkey-input__clicker {
  @include row--center;
  position: absolute;
  top: -2px;
  left: -2px;
  width: 39px;
  height: 36px;
  cursor: pointer;
  background: transparent;
  box-shadow: inset 0px 2px 4px rgba(255, 255, 255, 0.3),
    inset 0px -2px 2px rgba(145, 169, 192, 0.4);
  border-radius: $border-radius-default;
  transition: all .1s;

  svg {
    max-width: 70%;
    color: $colorAliceNight;
  }

  span {
    @include typography(md, default, bold);
    @include noSelect;
    color: $color90Black;
  }

  span.hotkey-special-text {
    @include typography(md, default, bold);
  }

  &:hover {
    background: $colorAliceShade;
  }

  &:active {
    background: $colorAliceShadow;
  }
}

.hotkey-input__control--active {
  background: $colorAliceShadow;

  .hotkey-input__clicker:hover {
    background: $colorAliceShadow;
  }
}

.hotkey-input__control--disabled {
  opacity: 0.8;

  .hotkey-input__clicker:hover,
  .hotkey-input__clicker:active {
    background: transparent;
    cursor: not-allowed;
  }
}

.hotkey-input__label {
  @include typography(sm, default, bold);
  white-space: nowrap;
  color: $colorAliceNight;
  @include noSelect;
}
</style>
