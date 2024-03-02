<template>
  <component
    :is="label ? 'label' : 'div'"
    class="text-area"
    :class="{
      'text-area--dark': theme === 'dark',
      'text-area--light': theme === 'light',
      'text-area--transparent': theme === 'transparent'
    }"
  >
    <div
      v-if="label"
      class="text-area__label"
    >
      {{ label }}
    </div>
    <textarea
      :id="id"
      v-model="inputText"
      class="text-area__input"
      type="textarea"
      :placeholder="placeholder"
      :name="name"
      :required="required"
      :disabled="disabled"
      @change="update"
      @keydown.stop="onKeyDown"
      @keyup.stop
      @keypress.stop
    />
  </component>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

const themeValidator = (value: string): boolean =>
  ['dark', 'light', 'transparent'].indexOf(value) !== -1

@Component({ name: 'text-area' })
export default class TextArea extends Vue {
  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  @Prop({ required: false, type: Boolean })
  required!: boolean

  @Prop({ required: true })
  value!: string

  @Prop({ required: false, default: null })
  label!: string | null

  @Prop({ required: false })
  id?: string | number

  @Prop({ required: false })
  placeholder?: string

  @Prop({ required: false })
  name?: string

  @Prop({ required: false, default: 'dark', validator: themeValidator })
  theme!: 'dark' | 'light' | 'transparent'

  get inputText (): string {
    return this.value
  }

  set inputText (val: string) {
    this.$emit('input', val)
    this.$emit('change', val)
  }

  @Watch('inputText')
  onInputText (): void {
    this.$emit('change', this.inputText)
  }

  update (e: any): void {
    this.inputText = e.target.value
  }

  onKeyDown (e: KeyboardEvent): void {
    if (
      // If the enter listener is not defined, no need to catch shift-enter
      // and add new line in that case
      !this.$listeners.enter ||
      // If the pressed key is not enter, just do the default behavior
      e.key !== 'Enter' ||
      // If the shift key is not pressed, just do the default behavior what enter does
      e.shiftKey
    ) { return }

    e.preventDefault()
    this.$emit('enter', e)
  }
}
</script>

<style lang="scss" scoped>
$input-height: 33px;

.text-area {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10px;
}

.text-area--dark {
  .text-area__input {
    background: $colorSecondaryLight3;
  }
}

.text-area--light {
  .text-area__input {
    background: $colorLineGrey;
  }
}

.text-area--transparent {
  .text-area__input {
    background: transparent;
  }
}

.text-area__label {
  @include typography(md-1, default);
  color: $colorSecondaryLight;
  margin-bottom: 7px;
}

.text-area__input {
  @include typography(lg, default);
  width: 100%;
  height: 100%;
  border: none;
  color: $colorSecondaryDark;
  padding: 15px 20px;
  background: $colorSecondaryLight3;
  box-shadow: inset 0px 2px 5px rgba(145, 169, 192, 0.3);
  resize: none;

  &:valid, &:focus, &:active {
    border: none;
    outline: none !important;
  }

  &::placeholder {
    @include typography(lg, default);
    color: $colorSecondaryLight;
  }
}
</style>
