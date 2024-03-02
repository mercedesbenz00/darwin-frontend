<template>
  <div
    class="inputfield"
    :class="{
      'inputfield--dark': theme === 'dark',
      'inputfield--light': theme === 'light'
    }"
  >
    <div
      v-if="label"
      class="inputfield__label"
      :class="{'inputfield__label--focus': focus}"
    >
      {{ label }}
    </div>
    <div class="inputfield__wrapper">
      <input
        :id="id"
        ref="inputfield"
        v-model="inputText"
        class="inputfield__input"
        :class="{
          'inputfield__input--error': !!internalError,
          'inputfield__input--non-empty': !isEmpty,
        }"
        :type="type"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :name="name"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :maxlength="maxlength"
        :disabled="disabled"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.stop
        @keyup.stop
        @keypress.stop
        @keydown.enter.stop="onEnter"
        @keydown.esc.stop="onEscape"
      >
      <div
        v-if="internalError"
        class="inputfield__error"
      >
        {{ internalError }}
      </div>
      <template v-else>
        <div
          v-if="hint"
          class="inputfield__hint"
        >
          {{ hint }}
        </div>
        <div class="inputfield__modifier">
          <slot name="modifier" />
        </div>
        <div class="inputfield__advisor">
          <slot name="advisor" />
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import isEmpty from 'validator/lib/isEmpty'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

const themeValidator = (value: string) => ['dark', 'light'].indexOf(value) !== -1

@Component({ name: 'input-field' })
export default class InputField extends Vue {
  $refs!: Vue['$refs'] & {
    inputfield: HTMLInputElement
  }

  @Prop({ required: true })
  value!: string | number

  @Prop({ required: false, default: null })
  label!: string | null

  @Prop({ required: false })
  id?: string | number

  @Prop({ required: false })
  name?: string

  @Prop({ required: false, default: null })
  placeholder!: string | null

  @Prop({ required: false })
  hint?: string

  @Prop({ required: false })
  autocomplete?: string

  @Prop({ required: false })
  min?: number

  @Prop({ required: false })
  max?: number

  @Prop({ required: false })
  required?: string

  @Prop({ required: false })
  maxlength?: number

  @Prop({ required: false, default: 'text' })
  type!: string

  @Prop({ required: false, default: false, type: Boolean })
  autoFocus!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  autofill!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  readonly!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  /**
   * Color theming for the field.
   *
   * Default is 'dark' and should be used on non-white backgrounds.
   * On white backgrounds, the theme should be 'light
   */
  @Prop({ required: false, default: 'dark', validator: themeValidator })
  theme!: 'dark' | 'light'

  // validation error logic

  /**
   * Allows setting error the conventional way, as a prop
   */
  @Prop({ required: false, default: null })
  error!: string | null

  /**
   * For usage with old, unconventional and difficult to test `setError`
   */
  internalError: string | null = null

  public setError (error?: string) {
    this.internalError = error || null
  }

  @Watch('inputText')
  onInputText () {
    this.internalError = null
    this.$refs.inputfield.value = this.inputText.toString()
  }

  @Watch('error')
  onError (value: string) {
    this.internalError = value
  }

  focus: boolean = false

  get inputText (): string | number {
    return this.value
  }

  set inputText (val: string | number) {
    this.$emit('input', val)
    this.$emit('change', val)
  }

  get isEmpty (): boolean {
    return !this.inputText || isEmpty(`${this.inputText}`)
  }

  mounted () {
    if (this.autoFocus) {
      this.$nextTick(() => {
        this.setFocus()
      })
    }

    if (this.error) {
      this.internalError = this.error
    }
  }

  public setFocus (focus: boolean = true) {
    const inputfield = this.$refs.inputfield
    if (!inputfield) { return }
    setTimeout(() => {
      focus
        ? inputfield.focus()
        : inputfield.blur()
    }, 500)
  }

  onFocus (): void {
    this.focus = true
  }

  onBlur (): void {
    this.$emit('blur')
    setTimeout(() => {
      this.focus = false
    }, 300)
  }

  onEnter (e: KeyboardEvent): void {
    this.$emit('enter', e)
  }

  onEscape (e: KeyboardEvent): void {
    this.$emit('escape', e)
  }
}
</script>

<style lang="scss" scoped>
$inputHeight: 36px;
$fontSize: 14px;

.inputfield {
  position: relative;
  @include col;
  width: 100%;
}

.inputfield__input {
  transition: background-color .2s ease;
  transition: color .2s ease;
  color: $color90Black;
  width: 100%;
  height: $inputHeight;
  border: none;
  border-radius: $border-radius-default;
  font-size: $fontSize;
  font-family: $fontFamilyDefault;
  padding: 6px 9px;
  background: $colorAliceBlue;
  box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);

  &:focus, &:active {
    border: none;
    outline: none !important;
  }

  &:disabled {
    color: $colorAliceNight;
    background: $colorLineGrey;
  }

  &::placeholder {
    color: $colorAliceNight;
  }
}

// this seems to be the common style now used across the app
// we should consider making it default
// basic rules are, different fg and bg when enabled/disabled
.inputfield--dark {
  .inputfield__input {
    background: $colorAliceShade;
  }

  .inputfield__input.inputfield__input--non-empty:not(:disabled),
  .inputfield__input:focus:not(:disabled) {
    background: $colorAliceShade;
  }

  .inputfield__input:disabled {
    background: $colorAliceShadow;
    color: $colorAliceNight;
    box-shadow: none;
  }
}

.inputfield--light {
  .inputfield__input {
    background: $colorAliceBlue;
  }
}

.inputfield__label {
  @include typography(md-1, default);
  color: $colorAliceNight;
  margin-bottom: 7px;

  &--focus {
    color: $colorPrimaryDark;
  }
}

.inputfield__wrapper {
  @include row--center;
  width: 100%;
  position: relative;
}

.inputfield__input--error {
  margin-top: 0;
  color: $colorPink;
}

.inputfield__hint {
  position: absolute;
  left: 0;
  bottom: -19px;
  @include typography(md, default);
  color: $colorAliceNight;
}

.inputfield__modifier {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  max-width: 120px;
  height: 100%;
  align-items: center;
  @include row;
  justify-content: flex-end;
}

.inputfield__advisor {
  position: absolute;
  right: 0;
  bottom: -17px;
  @include row;
  justify-content: flex-end;
}

.inputfield__error {
  position: absolute;
  left: 0;
  bottom: -19px;
  @include typography(md, default, bold);
  color: $colorPink;
}
</style>
