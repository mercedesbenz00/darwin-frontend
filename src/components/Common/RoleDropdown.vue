<template>
  <div class="role-dropdown">
    <div
      v-if="label"
      class="role-dropdown__label"
    >
      {{ label }}
    </div>
    <div class="role-dropdown__select">
      <Select2
        v-model="sel"
        :options="options"
        :settings="settings"
        :disabled="disabled"
        @select="onSelect($event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
/* global $ */
import { Component, Prop, Vue } from 'vue-property-decorator'

import { RoleDropdownOption } from './RoleDropdownOption'
import Select2 from './Select2.vue'

@Component({ name: 'role-dropdown', components: { Select2 } })
export default class RoleDropdown extends Vue {
  @Prop({ required: true })
  id!: string | number

  @Prop({ required: true })
  value!: string | number

  @Prop({ required: true })
  name!: string

  @Prop({ required: true })
  options!: RoleDropdownOption[]

  @Prop({ required: false })
  label!: string

  @Prop({ required: false })
  placeholder!: string

  @Prop({ required: false })
  autocomplete!: string

  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  get sel () {
    return this.value
  }

  set sel (val) {
    this.$emit('input', val)
    this.$emit('change', val)
  }

  get settings () {
    return {
      minimumResultsForSearch: Infinity,
      placeholder: this.placeholder,
      templateResult: this.formatTemplate.bind(this),
      theme: 'role',
      width: `${200 * this.$theme.getCurrentScale()}px`
    }
  }

  formatTemplate (state: { text: string, description: string }) {
    return $(`
    <div class="select2-results__option-cover">
      <div class="select2-results__option__title">
        ${state.text}
      </div>
      <div class="select2-results__option__description">
        ${state.description}
      </div>
    </div>
    `)
  }

  onSelect (param: RoleDropdownOption) {
    this.sel = param.id
  }
}
</script>

<style lang="scss" scoped>
.role-dropdown {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.role-dropdown__label {
  @include typography(md, default);
  color: $colorSecondaryLight;
  margin-bottom: 7px;
}

.role-dropdown__select {
  width: 100%;
  height: 36px;
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
.select2-container.select2-container--role {
  width: 100% !important;
  margin: 0;
  position: relative;
}

.select2-container.select2-container--role .select2-selection--single {
  @include height();
  outline: none;
  border: none;
  background-color: $colorAliceBlue;
  border-radius: $border-radius-default;
}

.select2-container.select2-container--role .select2-selection--single .select2-selection__rendered {
  border: none;
  @include typography(md-1, default);
  color: $colorSecondaryDark1;
  box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);
  padding: 9px;
}

.select2-container.select2-container--role.select2-container--focus .select2-selection--single .select2-selection__rendered {
  padding: 9px;
}

.select2-container.select2-container--role .select2-dropdown {
  width: 200px !important;
  background: $colorWhite;
  border: none;
  overflow: hidden;
  z-index: 1051;
}

.select2-container--role .select2-results__option {
  @include typography(md, default);
  color: $colorSecondaryLight;
  user-select: none;
  -webkit-user-select: none;
}

.select2-container--role .select2-results__option {
  background: $colorWhite;
}

.select2-container--role .select2-results__option .select2-results__option-cover {
  margin: 3px 6px;
}

.select2-container--role .select2-results__option .select2-results__option-cover .select2-results__option__title {
  margin-bottom: 7px;
  color: $colorSecondaryDark1;
  @include typography(md-1, default, normal);
}

.select2-container--role .select2-results__option .select2-results__option-cover .select2-results__option__description {
  color: $colorSecondaryLight;
  @include typography(sm, default, normal);
}

.select2-container--role .select2-search--dropdown {
  padding: 4px;
}
.select2-container--role .select2-search--dropdown .select2-search__field {
  padding: 4px;
  box-sizing: border-box;
}

.select2-container--role .select2-selection--single {
  background-color: transparent;
  border: none;
  border-radius: $border-radius-default;
}

.select2-container--role .select2-selection--single .select2-selection__rendered {
  color: $colorSecondaryDark1;
  @include height();
  line-height: normal;
}

.select2-container--role .select2-selection--single .select2-selection__clear {
  cursor: pointer;
  float: right;
  font-weight: bold;
}

.select2-container--role .select2-selection--single .select2-selection__placeholder {
  @include typography(md-1, default);
  color: $colorSecondaryLight1;
}

.select2-container--role .select2-selection--single .select2-selection__arrow {
  width: 14px;
  height: 26px;
  position: absolute;
  top: 0;
  right: 9px;
}

.select2-container--role .select2-selection--single .select2-selection__arrow b {
  position: absolute;
  border-left: 7px solid transparent !important;
  border-right: 7px solid transparent !important;
  border-top: 7px solid $colorPrimaryLight !important;
  border-bottom: none !important;
  left: auto;
  top: 55%;
  margin: 0;
  height: 0;
  width: 0;
}

.select2-container--role.select2-container--disabled .select2-selection--single .select2-selection__arrow {
  display: none;
}

.select2-container--role.select2-container--open .select2-selection--single .select2-selection__rendered {
  padding: 9px;
}

.select2-container--role.select2-container--disabled .select2-selection--single {
  cursor: default;
}

.select2-container--role.select2-container--disabled .select2-selection--single .select2-selection__rendered {
  color: $colorAliceNight;
}

.select2-container--role.select2-container--disabled .select2-selection--single .select2-selection__clear {
  display: none;
}

.select2-container--role.select2-container--open .select2-selection--single .select2-selection__arrow b {
  border: none;
  border-left: 7px solid transparent !important;
  border-right: 7px solid transparent !important;
  border-top: none !important;
  border-bottom: 7px solid $colorPrimaryLight !important;
}

.select2-container--role .select2-search--dropdown .select2-search__field {
  box-shadow: 0px 10px 60px rgba(11, 36, 72, 0.1), 0px 1px 2px rgba(11, 36, 72, 0.05);
  @include typography(md, headlines);
  letter-spacing: 0.5px;
  color: $colorSecondaryDark1;
  border-radius: 5px;
  border: 1px solid $colorSecondaryLight1;
}

.select2-container--role .select2-results > .select2-results__options {
  max-height: 200px;
  padding: 8px 0;
  overflow-y: auto;
}

.select2-container--role .select2-results__option--highlighted {
  background: $colorWhite;
}

.select2-container--role .select2-results__option--highlighted[aria-selected] {
  color: $colorSecondaryDark1;
}

.select2-container--role .select2-results__option[aria-selected=true] {
  background: $colorWhite;
}

.select2-container--role .select2-results__option--highlighted[aria-selected] {
  background: $colorLineGrey;
  font-weight: bold;
  color: $colorSecondaryDark1;
}

.select2-container--role .select2-results__option--highlighted[aria-selected]:hover {
  background: $colorLineGrey;
}

.select2-container--role.select2-container--open .select2-dropdown--above,
.select2-container--role.select2-container--open .select2-dropdown--below {
  left: -20px;
  padding: 8px 0;
  box-shadow: 0px -5px 60px rgba(11, 36, 72, 0.2), 0px 1px 2px rgba(58, 78, 108, 0.05);
  border-bottom: none;
  border-radius: $border-radius-default;
}
</style>
