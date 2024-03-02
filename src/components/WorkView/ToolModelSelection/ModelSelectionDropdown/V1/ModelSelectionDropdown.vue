<template>
  <div class="model__dropdown">
    <Select2
      v-model="sel"
      :options="options"
      :settings="settings"
      @select="onSelect($event)"
    />
  </div>
</template>

<script lang="ts">
/* global $, JQuery */
import { Component, Prop, Vue } from 'vue-property-decorator'

import Select2 from '@/components/Common/Select2.vue'
import { ClassPill, ModelIcon } from '@/components/WorkView/ToolModelSelection/components'
import { ClassDescriptor } from '@/components/WorkView/ToolModelSelection/types'
import { mountedComponentHtml } from '@/components/WorkView/ToolModelSelection/utils'

@Component({
  name: 'model-selection-dropdown',
  components: { Select2 }
})
export default class ModelSelectionDropdown extends Vue {
  @Prop({ required: true })
  value!: string | number

  @Prop({ required: true })
  options!: Array<any>

  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  @Prop({ required: false, default: '' })
  placeholder!: string

  error: string | null = null

  get settings () {
    return {
      disabled: this.disabled,
      matcher: this.matcher,
      placeholder: this.placeholder,
      searchInputPlaceholder: 'Type to search models',
      templateResult: this.formatTemplate.bind(this),
      templateSelection: this.formatSelection.bind(this),
      theme: 'model-select',
      width: '100%'
    }
  }

  // Custom matcher for Select2: https://select2.org/searching
  matcher (params: any, data: any): void | null {
    if (params.term === undefined) { return data }

    const searchTerm: string = params.term.toLowerCase().trim()
    // If there are no search terms, return all of the data
    if (searchTerm === '') { return data }

    // `data.text` is the text that is displayed for the data object
    // (in this case, the model's name)
    // match not just model's name, but also classes
    const modelMatch = data.text.toLowerCase().indexOf(searchTerm) > -1
    const classMatch = data.classes.some((c: ClassDescriptor) =>
      c.label.toLowerCase().indexOf(searchTerm) > -1)
    if (modelMatch || classMatch) {
      return data
    }

    // Return `null` if the term should not be displayed
    return null
  }

  get sel (): string | number {
    return this.value
  }

  set sel (val) {
    this.$emit('input', val)
    this.$emit('change', val)
  }

  formatSelection (state: any): JQuery<HTMLElement> {
    const modelIconHtml = mountedComponentHtml(ModelIcon, {
      modelType: state.type
    })

    const svgClass = 'model__list-item__type-icon annotation-type-icon'

    return $(`
      <div class="model__list-item__label-container">
        <svg viewBox="0 0 22 22" class="${svgClass}">${modelIconHtml}</svg>
        <span class="model__list-item__label model__list-item__label__small">${state.text}</span>
      </div>
    `)
  }

  formatTemplate (state: any): JQuery<HTMLElement> {
    const modelIconHtml = mountedComponentHtml(ModelIcon, {
      modelType: state.type
    })

    let spans = ''
    if ('classes' in state) {
      for (const classPayload of state.classes) {
        const classPillHtml = mountedComponentHtml(ClassPill, {
          color: classPayload.color,
          name: classPayload.name
        })
        spans = `${spans}${classPillHtml}`
      }
    }

    const classesContainer = spans
      ? `<div class="model__list-item__classes-container">${spans}</div>`
      : ''

    return $(`
      <div class="model__list-item">
        <div class="select2-results__option-cover model__list-item__container">
          <div class="model__list-item__availability"></div>
          <div class="model__list-item__info">
            <div class="model__list-item__label-container">
              <span class="model__list-item__label">${state.text}</span>
            </div>
            ${classesContainer}
          </div>
          <div class="model__list-item__type-icon">
            <svg viewBox="0 0 22 22" class="annotation-type-icon">${modelIconHtml}</svg>
          </div>
        </div>
      </div>
    `)
  }

  onSelect (item: { id: string}) {
    this.sel = item.id
  }
}
</script>

<style lang="scss" scoped>
.model__dropdown {
  position: relative;
  width: 100%;
  height: 33px;
  cursor: pointer;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">

$border-height: 2px;

// colors can be removed once darwin branch merged to master
$colorSecondaryDark1: #1F1F1F;
$colorPrimaryLight: #00D9C9;
$colorPrimaryLight2: #CCF7F3;

@mixin height($size: 'normal') {
  @if $size == 'normal' {
    height: 33px;
  } @else {
    height: 25px;
  }
}

.select2-container.select2-container--model-select .select2-dropdown {
  width: 360px !important;
  background: $colorSecondaryLight3;
  border: none;
  overflow: hidden;
  z-index: 1051;
}

.model__list-item__label-container {
  width: 200px;
  @include row;
  align-items: center;
  padding: 0;
  margin-top: 2px;
  gap: 5px;
}

.model__list-item__color-indicator {
  width: 10px;
  height: 10px;
  border-radius: $border-radius-default;
  display: inline-block;
  font-size: 0;
  margin-right: 9px;
}

.model__list-item__label {
  @include ellipsis(1, md);
  @include typography(md, default, bold);
  color: $colorSecondaryDark1;
  max-width: 260px;
  width: 260px;
  float: left;
  white-space: nowrap;
}

.model__list-item__label__small {
  max-width: 130px;
  width: 130px;
}

.model__list-item__availability {
  align-self: center;
  flex-basis: 16px;
  flex-grow: 0;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  min-width: 16px;
  min-height: 16px;
  border-radius: 50%;
  border: 0.2rem solid #E4F1E9;
  background-color: #60C78A;
}

.model__list-item__type-icon {
  flex-basis: 22px;
  align-self: center;
  width: 22px;
  height: 22px;
}

.model__list-item__type-icon svg {
  width: 100%;
  height: 100%;
}

.model__list-item__classes-container {
  @include row;
  align-items: left;
  margin-top: 5px;
  gap: 5px;
}

.model__list-item__info {
  flex-basis: 260px;
  width: 100%;
  @include col;
  justify-content: flex-start;
  padding: 8px 11px;
  @include typography(md, default, bold);

  .model__list-item__color-indicator {
    margin-right: 5px;
  }
}

.model__list-item {
  position: relative;
  overflow: hidden;
  background-color: $colorWhite;
  border-radius: 5px;
  border: 1px solid $colorWhite;
  padding: 0;
  box-shadow: $shadowXS;

  &:not(:last-child) {
    margin-bottom: 8px;
  }

  &:hover {
    background-color: $colorLineGrey;
  }
}

.select2-container--model-select .select2-results__option--highlighted {
  .model__list-item {
    background: $colorAliceShade;
  }
}

.select2-container--model-select .select2-results__option--highlighted[aria-selected] {
  .model__list-item {
    border: 1px solid $colorAliceNight;
    background: $colorAliceShadow;
  }
}

.model__list-item__container {
  padding: 0 15px;
  gap: 5px;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
}

.select2-container.select2-container--model-select {
  width: 260px;
  margin: 0;
  position: relative;
}
  .select2-container.select2-container--model-select .select2-selection--single {
    @include input-field-default;
    @include height();
    outline: none;
    border: none;
    border-radius: $border-radius-default;
  }
    .select2-container.select2-container--model-select .select2-selection--single .select2-selection__rendered {
      border: none;
      @include typography(lg, default, bold);
      @include row;
      align-items: center;
      color: $colorSecondaryDark1;
      padding: 0 11px; }
    .select2-container.select2-container--model-select.select2-container--focus .select2-selection--single .select2-selection__rendered {
      padding: 0 11px; }

.select2-container--model-select .select2-results__option {
  padding: 3px 6px;
  @include typography(md, default);
  color: $colorSecondaryLight;
  background: $colorLineGrey;
  user-select: none;
  -webkit-user-select: none; }
.select2-container--model-select .select2-results__option:last-child {
  padding: 3px 6px 6px 6px;
}
.select2-container--model-select .select2-results__option .select2-results__option-cover {
  margin: 0px;
}

.select2-container--model-select .select2-selection--single {
  position: relative;
  background-color: transparent;
  border: none;
  border-radius: $border-radius-default; }
  .select2-container--model-select .select2-selection--single .select2-selection__rendered {
    color: $colorSecondaryDark1;
    @include height();
    line-height: normal; }
  .select2-container--model-select .select2-selection--single .select2-selection__clear {
    cursor: pointer;
    float: right;
    font-weight: bold; }
  .select2-container--model-select .select2-selection--single .select2-selection__placeholder {
    @include typography(lg, default);
    color: $colorSecondaryLight1; }
  .select2-container--model-select .select2-selection--single .select2-selection__arrow {
    width: 14px;
    height: 100%;
    position: absolute;
    top: 0;
    right: 3px; }
    .select2-container--model-select .select2-selection--single .select2-selection__arrow b {
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid $colorPrimaryLight;
      border-bottom: none;
      position: absolute;
      left: auto;
      top: 45%;
      margin: 0;
      height: 0;
      width: 0; }
  .select2-container--model-select.select2-container--disabled .select2-selection--single .select2-selection__arrow {
    display: none;
  }
.select2-container--model-select.select2-container--open .select2-selection--single {
  border-radius: $border-radius-default; }
.select2-container--model-select.select2-container--open .select2-selection--single .select2-selection__rendered {
  padding: 0 11px; }
.select2-container--model-select.select2-container--disabled .select2-selection--single {
  background-color: inherit;
  cursor: default; }
  .select2-container--model-select.select2-container--disabled .select2-selection--single .select2-selection__clear {
    display: none; }
.select2-container--model-select.select2-container--open .select2-selection--single .select2-selection__arrow b {
  border: none;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: none;
  border-bottom: 5px solid $colorPrimaryLight; }
.select2-container--model-select .select2-search--dropdown .select2-search__field {
  @include typography(md, headlines);
  @include input-field-default;
  letter-spacing: 0.5px;
  border-radius: 5px;
  border: 1px solid $colorSecondaryLight1; }
.select2-container--model-select .select2-results > .select2-results__options {
  max-height: 400px;
  overflow-y: auto; }
.select2-container--model-select .select2-results__option--highlighted {
  background: transparent;
}
.select2-container--model-select .select2-results__option--highlighted[aria-selected] {
  font-weight: bold;
  color: $color90Black;
}
.select2-container--model-select .select2-results__option[aria-selected=true] {
  background: transparent; }

.select2-container--model-select.select2-container--open .select2-dropdown--above {
  @include dropdownAbove;
  border-radius: $border-radius-default; }
.select2-container--model-select.select2-container--open .select2-dropdown--below {
  @include dropdownBelow;
  margin-top: 10px;
  border-radius: $border-radius-default; }

.select2-container.select2-container--model-select .select2-dropdown--below .select2-search.select2-search--dropdown {
  padding: 5px;
}
.select2-container.select2-container--model-select .select2-dropdown--below .select2-search.select2-search--dropdown .select2-search__field {
  @include typography(md-1);
  @include input-field-default;
  height: 33px;
  border-radius: $border-radius-default;
  border: none;
  padding: 9px;
}
</style>
