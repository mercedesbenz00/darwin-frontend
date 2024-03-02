<template>
  <input
    ref="inputRef"
    type="number"
    class="login-tfa-number-cell"
    :class="{
      'login-tfa-number-cell--active': active
    }"
    :min="0"
    :max="9"
    :value="sanitizedCellValue"
  >
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
  name: 'login-tfa-number-cell'
})
export default class LoginTfaNumberCell extends Vue {
  @Prop({ required: true })
  value!: number | null

  @Prop({ required: true, type: Boolean })
  active!: boolean

  $refs!: {
    inputRef: HTMLInputElement
  }

  /**
   * `value` prop could be null, but input only works with strings, so
   * we use this computed to bind to the input.
   */
  get sanitizedCellValue (): string | null {
    return this.value === null ? '' : this.value.toString()
  }

  mounted (): void {
    this.setFocusIfActive()
  }

  @Watch('active', { immediate: true })
  onActive (): void {
    this.setFocusIfActive()
  }

  setFocusIfActive (): void {
    if (!this.active) { return }

    const { inputRef } = this.$refs
    if (!inputRef) { return }
    inputRef.focus()
  }
}
</script>

<style lang="scss" scoped>
.login-tfa-number-cell {
  @include row--center;
  width: 44px;
  height: 55px;
  border-radius: 10px;
  background: $colorAliceShade;
  border: 1px solid $colorAliceNight;
  @include typography(xl-1, inter);
  text-align: center;
  // CSS trick to hide the caret and show text only
  color: transparent;
  text-shadow: 1px 0 0 $color90Black;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type=number] {
    -moz-appearance: textfield;
  }
}

.login-tfa-number-cell--active {
  border: 1px solid $colorFeatherLight;
  box-sizing: border-box;
  box-shadow: 0px 0px 0px 2px rgba(0, 217, 201, 0.25);
  border-radius: 10px;
}
</style>
