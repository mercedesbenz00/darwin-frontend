<template>
  <label
    class="radio"
    :class="{
      'radio--disabled': disabled,
      'radio--gray': theme === 'gray',
      'radio--small': size === 'small'
    }"
    @click.prevent="onClick"
  >
    <input
      :id="id"
      type="radio"
      class="radio__input"
      :value="value"
      :name="name"
      :checked="checked"
    >
    <div class="radio__dump" />
    <div
      v-if="label"
      class="radio__title"
      v-html="label"
    />
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

export type RadioEvent = {
  id: string | number
  value: string | number
  label: string
  name: string
  selected: boolean
}

@Component({ name: 'radio-v2' })
export default class RadioV2 extends Vue {
  @Prop({ required: true })
  value!: string | number

  @Prop({ required: true })
  name!: string

  @Prop({ required: false })
  id?: string | number

  @Prop({ required: false })
  label!: string

  @Prop({ required: true, default: false, type: Boolean })
  selected!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  @Prop({
    required: false,
    validator: value => ['default', 'gray'].indexOf(value) !== -1
  })
  theme!: string

  @Prop({
    required: false,
    validator: value => ['default', 'small'].indexOf(value) !== -1
  })
  size!: string

  get checked () {
    return this.selected
  }

  onClick () {
    const params = {
      id: this.id,
      value: this.value,
      label: this.label,
      name: this.name
    }

    // emit click so any parent component could track attempts to click,
    // even on a disabled radio
    this.$emit('click', params)

    // only emit input if not disabled
    if (this.disabled) { return }

    this.$emit('input', {
      ...params,
      selected: !this.checked
    })
  }
}
</script>

<style lang="scss" scoped>
.radio {
  position: relative;
  display: inline-flex;
  width: 100%;
  height: 20px;
  cursor: pointer;
}

:not(.radio--disabled) > .radio__input {
  visibility: hidden;
  z-index: 400;

  &:not([disabled]) {
    cursor: pointer;
  }

  &:checked + .radio__dump::after {
    border: none;
    opacity: 1;
    background: $colorWhite;
  }

  &:checked + .radio__dump:hover {
    opacity: 1;
    background: $colorRadioHover;
  }

  &:checked + .radio__dump:active {
    opacity: 1;
    background: $colorRadioActive;
  }

  &:checked + .radio__dump {
    opacity: 1;
    background: $colorRadioDefault;
    border: none;
  }

  &:checked + .radio__dump:hover::after {
    border: none;
    opacity: 1;
    top: 7px;
    right: 7px;
    bottom: 7px;
    left: 7px;
  }
}

:not(.radio--disabled) > .radio__dump {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: $colorWhite;
  border: 1.5px solid $colorBorder;
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  z-index: 500;
  cursor: pointer;

  &::after {
    content: ' ';
    border: none;
    border-radius: 50%;
    position: absolute;
    top: 7px;
    right: 7px;
    bottom: 7px;
    left: 7px;
    background: $colorWhite;
    opacity: 0;
  }

  &:hover {
    background: none;
  }

  &:focus {
    border: 2px solid $colorRadioFocus;
  }

  &:active {
    background: $colorRadioUncheckedActive;
    border: 1.5px solid $colorNeutrals200;
  }

  &:hover::after {
    opacity: 1;
    top: 4px;
    right: 4px;
    bottom: 4px;
    left: 4px;
    background: $colorWhite;
  }
}

.radio__title {
  @include typography(md-1, inter, 500);
  margin-left: 12px;
  color: $colorContentSecondary;
  display: flex;
  align-items: center;
}

.radio--disabled {
  cursor: auto;
  .radio__input {
  visibility: hidden;
  z-index: 400;
  }
  .radio__dump {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: $colorRadioDisabled;
    border: 1px solid $colorRadioDisabled;
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    z-index: 500;
  }
}

.radio--small {
  height: 16px;

  .radio__dump {
    width: 16px;
    height: 16px;

    &::after {
      top: 5px;
      right: 5px;
      bottom: 5px;
      left: 5px;
    }

    &:hover::after {
      top: 3px;
      right: 3px;
      bottom: 3px;
      left: 3px;
    }
  }

  .radio__title {
    @include typography(md, inter, 500);
  }
}
</style>
