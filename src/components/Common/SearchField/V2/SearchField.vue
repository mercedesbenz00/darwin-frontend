<template>
  <div class="search-field">
    <lens-icon class="search-field__icon" />
    <input
      ref="input"
      v-model="search"
      type="text"
      class="search-field__input"
      :class="{ 'search-field__input--disabled': disabled }"
      :disabled="disabled"
      autofocus
      :placeholder="placeholder"
      @keydown.stop="onKeyDown"
      @keypress.stop
      @keyup.stop
      @keydown.enter.stop="$emit('enter')"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
    >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { LensIcon } from './assets/icons'

@Component({ name: 'search-field', components: { LensIcon } })
export default class SearchField extends Vue {
  @Prop({ required: true })
  value!: string

  @Prop({ required: false, default: 'Search...' })
  placeholder!: string

  @Prop({ default: false, type: Boolean })
  disabled!: boolean

  $refs!: {
    input: HTMLInputElement
  }

  get search (): string {
    return this.value
  }

  set search (val: string) {
    this.$emit('input', val)
    this.$emit('change', {
      value: val
    })
  }

  public setFocus (): void {
    this.$refs.input.focus()
  }

  onKeyDown (event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.$emit('esc', event)
    }
    this.$emit('keydown', event)
  }
}
</script>

<style lang="scss" scoped>
.search-field {
  @include row--center;
  position: relative;
  height: 36px;
  overflow: hidden;

  &__icon {
    position: absolute;
    top: 10px;
    left: 12px;
    bottom: 11px;
    width: 16px;
    height: 16px;
    color: $colorContentDefault;
  }

  &__input {
    flex: 1;
    height: 100%;
    max-width: 100%;
    @include typographyRegularBody100;
    border: 1px solid $colorInteractiveSecondaryHover;
    color: $colorContentDefault;
    background-color: transparent;
    padding: 12px 64px 12px 32.5px;
    border-radius: 10px;
    margin-right: 0.5px;

    &--disabled {
      opacity: 0.5;
    }

    &:hover {
      background-color: $colorOverlayHover;
    }

    &:active, &:focus {
      outline: none;
      border: 1.5px solid $colorInteractivePrimaryDefault;
      caret-color: $colorInteractivePrimaryDefault;
      color: $colorContentEmphasis;
      margin-right: 0;
      padding: 12px 64px 12px 32px;
    }

    &::placeholder {
      @include typographyRegularBody100;
      color: $colorContentSecondary;
    }
  }
}

</style>
