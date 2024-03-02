<template>
  <div
    class="dropdown"
    :class="{
      'dropdown--error': !!renderedError,
      [`dropdown--${theme}`]: true
    }"
  >
    <div
      v-if="label"
      class="dropdown__label"
    >
      {{ label }}
    </div>
    <div class="dropdown__select">
      <Select2
        :value="sel"
        :options="options"
        :settings="settings"
        @select="onSelect($event)"
      />
    </div>
    <div
      v-if="renderedError && !dirty"
      class="dropdown__error"
    >
      {{ renderedError }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import Select2 from '@/components/Common/Select2.vue'

import { LegacyDropdownOption } from './types'

@Component({ name: 'dropdown', components: { Select2 } })
export default class Dropdown extends Vue {
  @Prop({ required: true })
  value!: string | number

  @Prop({ required: true })
  options!: LegacyDropdownOption[]

  @Prop({ required: false, default: 'dark', type: String as () => 'dark' | 'light' })
  theme!: 'dark' | 'light'

  @Prop({ required: false })
  label!: string

  @Prop({ required: false })
  placeholder!: string

  @Prop({ required: false })
  autocomplete!: string

  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  search!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  readonly!: boolean

  @Prop({ required: false, type: String })
  dropdownParentSelector?: string

  // validation error logic

  /**
   * Allows setting error the conventional way, as a prop
   */
  @Prop({ required: false, default: null })
  error!: string | null

  /**
   * For usage with old, unconventional and difficult to test `setError`
   */
  private internalError: string | null | undefined = null

  public setError (error?: string) {
    this.internalError = error
  }

  /**
   * This is the error that gets rendered in the template.
   *
   * It's a proxy which returns prop-based error if
   * available and fall back to internal error if not.
   *
   * We should strive to eliminate setError based logic,
   * as it is more difficult to test.
   */
  get renderedError (): string | null | undefined {
    return this.error || this.internalError
  }

  /** Used to stop rendering validation error when user starts typing */
  dirty: boolean = false
  @Watch('renderedError')
  onError () { this.dirty = false }

  @Watch('sel')
  onSel () { this.dirty = true }

  get sel () {
    return this.value
  }

  set sel (val) {
    this.$emit('input', val)
    this.$emit('change', val)
  }

  get settings () {
    return {
      dropdownParentSelector: this.dropdownParentSelector,
      disabled: this.disabled || this.readonly,
      minimumResultsForSearch: this.search ? undefined : Infinity,
      placeholder: this.placeholder || this.label,
      templateResult: this.formatTemplate.bind(this),
      width: '100%'
    }
  }

  formatTemplate (state: { id: string | number, text: string }) {
    // eslint-disable-next-line
    return $(`
    <div class="select2-results__option-cover">
      ${state.text}
    </div>
    `)
  }

  onSelect (param: LegacyDropdownOption) {
    this.sel = param.id
  }
}
</script>

<style lang="scss" scoped>
.dropdown {
  position: relative;
  width: 100%;
  cursor: pointer;
  overflow: hidden;
}

.dropdown__label {
  @include typography(md-1, default);
  color: $colorAliceNight;
  margin-bottom: 7px;
}

.dropdown__select {
  width: 100%;
  height: 36px;
}

.dropdown__select :deep(.select2-selection__rendered) {
  border: none;
  @include typography(md-1, default);
  color: $color90Black;
  box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);
  border-radius: $border-radius-default;
  padding: 9px;

  .dropdown--light & {
    background: $colorAliceBlue;
  }

  .dropdown--dark & {
    background: $colorAliceShade;
  }
}

.dropdown__error {
  margin-top: 5px;
  @include typography(sm, default, bold);
  color: $colorPink;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
$border-height: 2px;

@mixin height($size: 'normal') {
  @if $size == 'normal' {
    height: 36px;
  } @else {
    height: 25px;
  }
}

.select2-container.select2-container--default {
  margin: 0;
  position: relative;
}

.select2-container.select2-container--default .select2-selection--single {
  @include height();
  outline: none;
  border: none;
  background-color: transparent;
  border-radius: $border-radius-default;
}

.select2-container.select2-container--default.select2-container--focus .select2-selection--single .select2-selection__rendered {
  padding: 9px;
}

.select2-container.select2-container--default .select2-dropdown {
  background: $colorWhite;
  border: none;
  overflow: hidden;
  z-index: 1051;
}

.select2-container--default .select2-results__option {
  @include typography(md, default);
  color: $colorSecondaryLight;
  user-select: none;
  -webkit-user-select: none;
}

.select2-container--default .select2-results__option:nth-child(odd) {
  background: $colorGriteDark;
}

.select2-container--default .select2-results__option:nth-child(even) {
  background: $colorWhite;
}

.select2-container--default .select2-results__option .select2-results__option-cover {
  margin: 8px 10px;
}

.select2-container--default .select2-search--dropdown {
  padding: 4px;
}

.select2-container--default .select2-search--dropdown .select2-search__field {
  padding: 4px;
  box-sizing: border-box;
}

.select2-container--default .select2-selection--single {
  background-color: transparent;
  border: none;
  border-radius: $border-radius-default;
}
.select2-container--default .select2-selection--single .select2-selection__rendered {
  color: $color90Black;
  @include height();
  line-height: normal;
}

.select2-container--default .select2-selection--single .select2-selection__clear {
  cursor: pointer;
  float: right;
  font-weight: bold;
}

.select2-container--default .select2-selection--single .select2-selection__placeholder {
  @include typography(md-1, default);
  color: $colorAliceShadow;
}

.select2-container--default .select2-selection--single .select2-selection__arrow {
  width: 14px;
  height: 26px;
  position: absolute;
  top: 0;
  right: 9px;
}

.select2-container--default .select2-selection--single .select2-selection__arrow b {
  position: absolute;
  border-left: 7px solid transparent !important;
  border-right: 7px solid transparent !important;
  border-top: 7px solid $colorFeatherLight !important;
  border-bottom: none !important;
  left: auto;
  top: 55%;
  margin: 0;
  height: 0;
  width: 0;
}

.select2-container--default.select2-container--disabled .select2-selection--single .select2-selection__arrow {
  display: none;
}
.select2-container--default.select2-container--open .select2-selection--single .select2-selection__rendered {
  padding: 9px;
}

.select2-container--default.select2-container--disabled .select2-selection--single {
  background-color: inherit;
  cursor: default;
}

.select2-container--default.select2-container--disabled .select2-selection--single .select2-selection__clear {
  display: none;
}

.select2-container--default.select2-container--open .select2-selection--single .select2-selection__arrow b {
  border: none;
  border-left: 7px solid transparent !important;
  border-right: 7px solid transparent !important;
  border-top: none !important;
  border-bottom: 7px solid $colorFeatherLight !important;
}

.select2-container--default .select2-search--dropdown .select2-search__field {
  box-shadow: 0px 10px 60px rgba(11, 36, 72, 0.1), 0px 1px 2px rgba(11, 36, 72, 0.05);
  @include typography(md, headlines);
  letter-spacing: 0.5px;
  color: $color90Black;
  border-radius: 5px;
  border: 1px solid $colorAliceShadow;
}
.select2-container--default .select2-results > .select2-results__options {
  max-height: 200px;
  overflow-y: auto;
}

.select2-container--default .select2-results__option--highlighted:nth-child(odd) {
  background: $colorGriteDark;
}

.select2-container--default .select2-results__option--highlighted:nth-child(odd)[aria-selected] {
  font-weight: bold;
  color: $color90Black;
}

.select2-container--default .select2-results__option--highlighted:nth-child(even) {
  background: $colorWhite;
}

.select2-container--default .select2-results__option--highlighted:nth-child(even)[aria-selected] {
  font-weight: bold;
  color: $color90Black;
}

.select2-container--default .select2-results__option[aria-selected=true]:nth-child(odd) {
  background: $colorGriteDark;
}

.select2-container--default .select2-results__option[aria-selected=true]:nth-child(even) {
  background: $colorWhite;
}

.select2-container--default .select2-results__option--highlighted[aria-selected] {
  background: $colorFeatherFadeLight;
  font-weight: bold;
  color: $color90Black;
}

.select2-container--default .select2-results__option--highlighted[aria-selected]:hover {
  background: $colorFeatherFadeLight;
}

.select2-container--default.select2-container--open .select2-dropdown--above {
  box-shadow: 0px -5px 60px rgba(11, 36, 72, 0.2), 0px 1px 2px rgba(58, 78, 108, 0.05);
  border-bottom: none;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.select2-container--default.select2-container--open .select2-dropdown--below {
  box-shadow: 0px 5px 60px rgba(11, 36, 72, 0.2), 0px 1px 2px rgba(58, 78, 108, 0.05);
  border-top: none;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.dropdown--error .select2-container.select2-container--default .select2-selection--single .select2-selection__rendered {
  color: 2px solid $colorPink !important;
}

.dropdown--error .select2-container.select2-container--default.select2-container--focus .select2-selection--single .select2-selection__rendered {
  color: 2px solid $colorPink !important;
}

.dropdown--error .select2-container--default.select2-container--open .select2-selection--single .select2-selection__rendered {
  color: 1px solid $colorPink;
}

.dropdown--error .select2-container.select2-container--default .select2-selection--single .select2-selection__rendered {
  color: 1px solid $colorPink;
}
</style>
