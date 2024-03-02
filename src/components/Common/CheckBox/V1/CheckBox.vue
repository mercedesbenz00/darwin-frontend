<template>
  <label
    class="check-box"
    :class="{
      'check-box--checked': value,
      'check-box--disabled': disabled,
      [`check-box--${type}`]: true,
      [`check-box--${size}`]: true,
    }"
    :title="label"
  >
    <input
      :id="id"
      v-model="checked"
      type="checkbox"
      class="check-box__input"
      :value="chkValue || id"
      :name="name"
      :disabled="disabled"
    >
    <check-icon class="check-box__control" />
    <div
      v-if="label"
      class="check-box__label"
      v-html="label"
    />
  </label>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import CheckIcon from './assets/check.svg?inline'

export type CheckBoxEvent = {
  id: string | number
  value: boolean
  chkValue: string | number
  name: string
  checked: boolean
}

const typeValidator = (value: string) => ['rect', 'circle'].indexOf(value) !== -1
const sizeValidator = (value: string) => ['default', 'small'].indexOf(value) !== -1

@Component({ name: 'check-box', components: { CheckIcon } })
export default class CheckBox extends Vue {
  // Name should be unique for each group on the page
  @Prop({ required: false })
  name!: string

  @Prop({ required: false, type: Boolean, default: false })
  value!: boolean

  @Prop({ required: false, type: [String, Number] })
  id!: string | number

  @Prop({ required: false, type: [String, Number] })
  chkValue!: string | number

  @Prop({ required: false, type: Boolean, default: false })
  disabled!: boolean

  @Prop({ required: false })
  label!: string

  @Prop({ required: false, validator: typeValidator, default: 'rect' })
  type!: 'rect' | 'circle'

  @Prop({ required: false, validator: sizeValidator, default: 'default' })
  size!: 'default' | 'small'

  get checked (): boolean {
    return this.value
  }

  set checked (val: boolean) {
    this.$emit('input', val)
    this.$emit('change', {
      id: this.id,
      value: this.chkValue,
      chkValue: this.chkValue,
      name: this.name,
      checked: val
    })
  }
}
</script>

<style lang="scss" scoped>
.check-box {
  display: grid;

  grid-auto-flow: column;
  column-gap: 0.5em;

  justify-content: start;
  align-items: center;

  height: 20px;

  transition: color .2s;

  cursor: pointer;

  color: $colorBlack;

  :deep(svg) {
    height: 20px;
    width: 20px;
    color: $colorAliceShadow;
    transition: color, background-color .2s;
  }

  :deep(svg path) {
    transition: opacity .2s;
    opacity: 0;
  }
}

.check-box--disabled {
  cursor: auto;
}

.check-box:not(.check-box--disabled) .check-box__control,
.check-box:not(.check-box--disabled) .check-box__input {
  cursor: pointer;
}

.check-box--checked {
  .check-box__control {
    background: $colorFeatherFadeLight;
  }

  :deep(svg) {
    color: $colorFeatherLight;
  }

  :deep(svg path) {
    opacity: 1;
  }
}

.check-box__control {
  border: 1.5px solid $colorAliceShadow;
}

.check-box--checked .check-box__control {
  border-color: $colorFeatherLight;
}

.check-box__input,
.check-box__control {
  border-radius: 3px;

  grid-column: 1 / 2;
  grid-row: 1 / 2;
}

.check-box__input {
  opacity: 0;
}

.check-box__input,
.check-box__control {
  height: 15px;
  width: 15px;
}

.check-box__control {
  transition: all .2s;
  transition-property: background-color;
}

.check-box:hover:not(.check-box--disabled):not(.check-box--checked) .check-box__control {
  background: $colorAliceShadow;
}

.check-box__label {
  @include typography(md-1, default);
}

.check-box--disabled {
  opacity: 0.5;
}

.check-box.check-box--small {
  height: 16px;

  .check-box__label {
    @include typography(md, default);
  }
}

.check-box--circle .check-box__control {
  border-radius: 50%;

  :deep(path) {
    transform-origin: center;
    transform: scale(0.8);
  }
}
</style>
