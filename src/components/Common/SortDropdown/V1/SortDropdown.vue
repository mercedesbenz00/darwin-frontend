<template>
  <div class="sort-dropdown">
    <div class="dropdown">
      <Select2
        v-model="sel"
        :options="options"
        :settings="settings"
        @select="onSelect($event)"
      />
    </div>
    <button
      v-tooltip="{
        content: direction === 'asc' ? 'Ascending' : 'Descending'
      }"
      type="button"
      class="sort-dropdown__direction"
      :class="{'sort-dropdown__direction--reverse': direction === 'asc'}"
      @click="onDirectionChange"
    >
      <sort-arrow-icon />
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { SortArrowIcon } from '@/assets/icons/V1'
import Select2 from '@/components/Common/Select2.vue'
import { DropdownOption } from '@/components/Common/SortDropdown/types'

@Component({ name: 'sort-dropdown', components: { Select2, SortArrowIcon } })
export default class SortDropdown extends Vue {
  @Prop({ required: true })
  value!: string | number

  @Prop({ required: true })
  options!: DropdownOption[]

  @Prop({ required: false, default: 'normal' })
  size!: 'small' | 'normal'

  @Prop({
    required: false,
    default: 'asc',
    validator: value => ['asc', 'desc'].indexOf(value) !== -1
  })
  direction!: 'asc' | 'desc'

  get sel (): string | number {
    return this.value
  }

  set sel (val) {
    this.$emit('input', val)
    this.$emit('change', val)
  }

  get settings (): any {
    return {
      minimumResultsForSearch: -1,
      templateResult: this.formatTemplate.bind(this),
      templateSelection: this.formatTemplate.bind(this),
      theme: 'sort',
      width: '100%'
    }
  }

  formatTemplate (state: DropdownOption) {
    let iconHtml = ''
    if (state.icon) {
      iconHtml = `<img src=${state.icon} class="select2-results__option__icon">`
    }

    const smallClass = this.size === 'small' ? 'select2-results__option-cover--small' : ''
    const html =
      `<div class="select2-results__option-cover ${smallClass}">
        ${iconHtml} <span>${state.text}</span>
      </div>`
    return $(html)
  }

  onSelect (option: DropdownOption): void {
    this.sel = option.id
  }

  onDirectionChange (): void {
    this.$emit('change-direction', this.direction === 'asc' ? 'desc' : 'asc')
  }
}
</script>

<style lang="scss" scoped>
.sort-dropdown {
  position: relative;
}

.sort-dropdown__direction {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 21px;
  height: 33px;
  padding: 9px 10px 9px 0;
  z-index: 700;
  background: transparent;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.sort-dropdown__direction--reverse {
  width: 21px;
  height: 33px;

  svg {
    transform: rotateZ(180deg);
  }
}

.dropdown {
  position: relative;
  width: 100%;
  height: 35px;
  cursor: pointer;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
$border-height: 2px;

@mixin height($size: 'normal') {
  @if $size == 'normal' {
    height: 35px;
  } @else {
    height: 25px;
  }
}

.select2-container.select2-container--sort {
  margin: 0;
  position: relative;
}
  .select2-container.select2-container--sort .select2-selection--single {
    @include height();
    outline: none;
    background-color: $colorWhite;
    border: none;
  }
    .select2-container.select2-container--sort .select2-selection--single .select2-selection__rendered {
      border: none;
      @include typography(md, default);
      color: $colorSecondaryDark1;
      padding: 4.5px 14px 5.5px 14px;
      border-radius: $border-radius-default;
      border-bottom: 2px solid $colorSecondaryLight1; }
    .select2-container.select2-container--sort.select2-container--focus .select2-selection--single .select2-selection__rendered {
      padding: 4.5px 14px 5.5px 14px;
      border-bottom: 2px solid $colorPrimaryLight; }

.select2-dropdown {
  background: $colorWhite;
  border: none;
  overflow: hidden;
  z-index: 1051; }

.select2-container--sort .select2-results__option {
  @include typography(md, default);
  color: $colorSecondaryDark1;
  user-select: none;
  padding: 3px 13px;
  height: 30px;
  background: $colorWhite;
  -webkit-user-select: none; }
.select2-container--sort .select2-results__option-cover {
  margin: 0;
  @include row;
  align-items: center;
}
  .select2-container--sort .select2-results__option-cover .select2-results__option__icon {
    width: 24px;
    height: 24px;
    margin-right: 8.5px;
    object-fit: contain;
  }

.select2-container--sort .select2-search--dropdown {
  padding: 4px; }
  .select2-container--sort .select2-search--dropdown .select2-search__field {
    padding: 4px;
    box-sizing: border-box; }

.select2-container--sort .select2-selection--single {
  background-color: $colorWhite;
  border: none;
  border-radius: $border-radius-default; }
  .select2-container--sort .select2-selection--single .select2-selection__rendered {
    color: $colorSecondaryDark;
    @include height();
    line-height: normal; }
  .select2-container--sort .select2-selection--single .select2-selection__clear {
    cursor: pointer;
    float: right;
    font-weight: bold; }
  .select2-container--sort .select2-selection--single .select2-selection__placeholder {
    @include typography(lg, default);
    color: $colorSecondaryLight1; }
  .select2-container--sort .select2-selection--single .select2-selection__arrow {
    width: 0;
    height: 0;
    position: absolute; }
    .select2-container--sort .select2-selection--single .select2-selection__arrow b {
      width: 100%;
      height: 100%;
      border: none; }
  .select2-container--sort.select2-container--disabled .select2-selection--single .select2-selection__arrow {
    display: none;
  }

.select2-container--sort.select2-container--open .select2-selection--single .select2-selection__rendered {
  padding: 4.5px 14px 5.5px 14px;
  border-bottom: 2px solid $colorPrimaryLight; }
.select2-container--sort.select2-container--disabled .select2-selection--single {
  background-color: inherit;
  cursor: default; }
  .select2-container--sort.select2-container--disabled .select2-selection--single .select2-selection__clear {
    display: none; }

.select2-container--sort.select2-container--open .select2-selection--single .select2-selection__arrow b {
  border: none; }

.select2-container--sort .select2-search--dropdown .select2-search__field {
  display: none;
  box-shadow: 0px 10px 60px rgba(11, 36, 72, 0.1), 0px 1px 2px rgba(11, 36, 72, 0.05);
  @include typography(md, headlines);
  letter-spacing: 0.5px;
  color: $colorSecondaryDark;
  border-radius: 5px;
  border: 1px solid $colorSecondaryLight; }

.select2-container--sort .select2-results > .select2-results__options {
  padding: 4px 0;
  max-height: 200px;
  overflow-y: auto; }

.select2-container--sort .select2-results__option[aria-selected=true]:nth-child(odd) {
  background: $colorPrimaryLight2; }
.select2-container--sort .select2-results__option[aria-selected=true]:nth-child(even) {
  background: $colorPrimaryLight2; }

.select2-container--sort .select2-results__option--highlighted[aria-selected] {
  font-weight: bold;
  color: $colorSecondaryDark1; }
.select2-container--sort .select2-results__option--highlighted:nth-child(odd) {
  background: $colorPrimaryLight2;
}
.select2-container--sort .select2-results__option--highlighted:nth-child(even) {
  background: $colorPrimaryLight2;
}

.select2-container--open .select2-dropdown--above {
  @include dropdownAbove;
  border-bottom: none;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px; }

.select2-container--open .select2-dropdown--below {
  @include dropdownBelow;
  border-top: none;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px; }
</style>
