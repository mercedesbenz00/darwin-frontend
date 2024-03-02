<template>
  <input
    ref="input"
    v-model.number="_value"
    class="small-numeric-input"
    type="number"
    :min="min"
    :max="max"
    @keydown.stop="onKeyDown"
  >
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

/**
 * Small Numeric Input component that only accepts numbers for its input.
 */
@Component({ name: 'small-numeric-input' })
export default class SmallNumericInput extends Vue {
  @Prop({ required: true, type: Number })
  value!: number

  @Prop({ required: false, type: Number })
  min?: number

  @Prop({ required: false, type: Number })
  max?: number

  $refs!: {
    input: HTMLInputElement
  }

  get _value () { return this.value }
  set _value (val: number) {
    const sanitized = this.sanitizeNumber(val)
    this.$emit('input', sanitized)
  }

  sanitizeNumber (val: number): number {
    let sanitized = val
    if (this.min) { sanitized = Math.max(this.min, sanitized) }
    if (this.max) { sanitized = Math.min(this.max, sanitized) }
    return sanitized
  }

  onKeyDown (event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === 'Escape') {
      this.$refs.input.blur()
    }
  }
}
</script>

<style lang="scss" scoped>
.small-numeric-input {
  background: $colorAliceShadow;
  box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);
  border-radius: 5px;
  color: $color90Black;
  padding: 3px 2px;
  text-align: center;
  @include typography(md-1, mulish);
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

}
</style>
