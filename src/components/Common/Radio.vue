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

@Component({ name: 'radio' })
export default class Radio extends Vue {
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

.radio__input {
  visibility: hidden;
  z-index: 400;

  &:not([disabled]) {
    cursor: pointer;
  }

  &:checked + .radio__dump::after {
    border: none;
    opacity: 1;
    background: $colorPrimaryDark;
    border: 1px solid $colorPrimaryDark;
  }

  &:checked + .radio__dump:hover {
    border: 1px solid $colorPrimaryDark;
  }

  &:checked + .radio__dump {
    border: 1px solid $colorPrimaryDark;
  }

  &:checked + .radio__dump:hover::after {
    border: none;
    opacity: 1;
  }
}

.radio__dump {
  width: 20px;
  height: 20px;
  border: 1px solid $colorSecondaryLight;
  border-radius: $border-radius-default;
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  z-index: 500;
  cursor: pointer;

  &::after {
    content: ' ';
    border: none;
    border-radius: $border-radius-default;
    position: absolute;
    top: 2px;
    right: 2px;
    bottom: 2px;
    left: 2px;
    background: $colorPrimaryDark;
    opacity: 0;
  }

  &:hover::after {
    opacity: 1;
    background: $colorSecondaryLight1;
  }
}

.radio__title {
  @include typography(md-1, default);
  margin-left: 15px;
  color: $colorSecondaryLight;
  display: flex;
  align-items: center;
}

.radio--disabled {
  opacity: 0.5;
  cursor: auto;
}

.radio--small {
  height: 16px;

  .radio__dump {
    width: 16px;
    height: 16px;
  }

  .radio__title {
    @include typography(md, default);
    margin-left: 10px;
  }
}

.radio--gray {
  .radio__title {
    color: $colorGrayLite2;
  }
}
</style>
