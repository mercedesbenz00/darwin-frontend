<template>
  <div class="hotkey-input">
    <label class="hotkey-input__label">Hotkey</label>
    <div
      class="hotkey-input__control"
      :class="{
        'hotkey-input__control--active': isAddingHotkey,
        'hotkey-input__control--disabled': disabled
      }"
    >
      <div
        v-tooltip="clickerTooltip"
        class="hotkey-input__clicker"
        @click="enableHotkeyListener"
      >
        <more-horizontal-icon v-if="!hotkey || isAddingHotkey" />
        <span v-else>{{ hotkey }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { MoreHorizontalIcon } from '@/assets/icons/V1'

@Component({
  name: 'hotkey-input',
  components: { MoreHorizontalIcon }
})
export default class HotkeyInput extends Vue {
  @Prop({ required: false, default: null })
  hotkey!: string | null

  @Prop({ required: false, type: Boolean, default: false })
  disabled!: boolean

  isAddingHotkey: boolean = false

  get clickerTooltip () {
    return this.disabled
      ? {
        content: 'You can only add hotkey in the dataset'
      }
      : {
        content: 'Press a key between 1 and 9 to select this class'
      }
  }

  beforeDestroy () {
    this.disableHotkeyListener()
  }

  enableHotkeyListener () {
    if (this.disabled) { return }
    this.isAddingHotkey = true
    document.addEventListener('keydown', this.onKeydown)
  }

  disableHotkeyListener () {
    if (this.disabled) { return }
    this.isAddingHotkey = false
    document.removeEventListener('keydown', this.onKeydown)
  }

  onKeydown (event: KeyboardEvent) {
    if (this.disabled) { return }
    event.preventDefault()
    event.stopPropagation()

    if (event.key === 'Escape') {
      this.disableHotkeyListener()
      return
    }

    // Instead of keyCode which is deprecated
    if (!['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
      this.$store.dispatch('toast/notify', {
        content: 'Type a number between 1 and 9 to set a class hotkey'
      })
      return
    }

    this.$emit('update:hotkey', event.key)
    this.$emit('change', event.key)
    this.disableHotkeyListener()
  }
}
</script>

<style lang="scss" scoped>
.hotkey-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  width:45px;
  margin-top: -1.4rem;
  flex-shrink: 0;
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
  box-shadow: inset 0px 2px 4px rgba(255, 255, 255, 0.3), inset 0px -2px 2px rgba(145, 169, 192, 0.4);
  border-radius: $border-radius-default;
  transition: all .1s;

  svg {
    max-width: 70%;
    color: $colorAliceNight;
  }

  span {
    @include typography(lg-1, default, bold);
    @include noSelect;
    color: $color90Black;
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
  }
}

.hotkey-input__label {
  @include typography(sm, default, bold);
  white-space: nowrap;
  color: $colorAliceNight;
  @include noSelect;
}
</style>
