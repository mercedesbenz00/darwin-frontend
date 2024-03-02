<!--
  This component is based on https://select2.org/ component.

  *** Component Usage ***
  <check-list-dropdown
    id="exportFilterClass"
    name="exportFilterClass"
    placeholder="Select Class"
    :options="filterClassOptions"
    @change="onClassSelect($event)"
  ></check-list-dropdown>

  *** Params ***
    options: [{
      id: id,
      text: text,
      ...
    }]

  *** Event ***
    change (evt) {
      evt: {
        id, name, placeholder, options, size(From the props)
        value(List of Ids)
      }
    }
-->
<template>
  <div
    v-click-outside="onBlur"
    class="checklist-dropdown"
    :class="{
      'checklist-dropdown--small': size === 'small',
      'checklist-dropdown--error': !!error,
      'checklist-dropdown--white': white,
      'checklist-dropdown--has-selected': values && values.length > 0
    }"
    @click="onClick"
  >
    <Select2
      v-model="values"
      :options="fullOptions"
      :settings="settings"
      @change="onChange($event)"
      @select="onSelect($event)"
    />
    <div
      v-if="error"
      class="checklist-dropdown__error"
    >
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
/* global $ */
import { cloneDeep } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'

import Select2 from './Select2.vue'

export type CheckListDropdownOption = {
  id: string | number
  text: string
  density?: number
  selected?: boolean
}

export type CheckListDropdownEvent = {
  id: string
  name: string
  placeholder: string
  value: any[]
  options: CheckListDropdownOption[]
  size: string
}

@Component({
  name: 'check-list-dropdown',
  components: { Select2 }
})
export default class CheckListDropdown extends Vue {
  @Prop({ required: true, default: () => [] })
  options!: CheckListDropdownOption[]

  @Prop({ required: false, default: `${Math.floor(Math.random() * 1000000)}` })
  id!: string

  @Prop({ required: false, default: '' })
  name!: string

  @Prop({ required: false, default: '' })
  header!: string

  @Prop({ required: false, default: null })
  error!: string | null

  @Prop({ required: false, default: '' })
  placeholder!: string

  @Prop({ required: false, default: 'default' })
  size!: 'default' | 'small'

  @Prop({ required: false, default: false, type: Boolean })
  white!: boolean

  open: boolean = false
  textSorterId: string | null = null
  densitySorterId: string | null = null
  sorter: 'density' | 'text' | null = null
  sortOrder: number = 0
  values: any[] | null = null

  get fullOptions () {
    return [{ id: 'header', disabled: true }, ...this.options]
  }

  get sortedOptions () {
    let sorted = cloneDeep(this.options)

    if ((this.sortOrder === 1 || this.sortOrder === -1)) {
      sorted = sorted.sort((a, b) => {
        let cmp = 0
        if (this.sorter && a[this.sorter]! > b[this.sorter]!) {
          cmp = 1
        } else if (this.sorter && a[this.sorter] === b[this.sorter]) {
          cmp = 0
        } else {
          cmp = -1
        }
        return this.sortOrder * cmp
      })
    }

    return [{ id: 'header', disabled: true }, ...sorted]
  }

  get settings () {
    return {
      closeOnSelect: false,
      dropdownAutoWidth: true,
      multiple: true,
      placeholder: this.placeholder,
      templateResult: this.formatTemplate.bind(this),
      theme: 'checklist',
      width: '100%'
    }
  }

  mounted () {
    // register text sorter
    this.textSorterId = `${this.id}-${this.name}-text-sorter`
    $(document).on(`click.${this.textSorterId}`, `#${this.textSorterId}`, (evt) => {
      evt.preventDefault()
      evt.stopPropagation()
      this.onSort('text')
    })

    // register density sorter
    this.densitySorterId = `${this.id}-${this.name}-density-sorter`
    $(document).on(`click.${this.textSorterId}`, `#${this.densitySorterId}`, (evt) => {
      evt.preventDefault()
      evt.stopPropagation()
      this.onSort('density')
    })

    // if the selection data contains preselected values,
    // we need to set them for the internal select2 element
    if (this.options.some(o => o.selected)) {
      this.values = this.options.filter(o => o.selected).map(o => o.id)
    }

    this.$once('hook:beforeDestroy', () => {
      $(document).off(`click.${this.textSorterId}`, `#${this.textSorterId}`)
      $(document).off(`click.${this.textSorterId}`, `#${this.densitySorterId}`)
    })
  }

  /**
   * formatTemplate: returns the list item of the dropdown
   * Returns sorter & check list item html components
   */
  formatTemplate (state: any) {
    if (state.id === 'header') { return this.formatHeader() }
    return this.formatOption(state)
  }

  formatHeader () {
    if (!this.header) { return null }

    const wrapperClasses = ['select2-results__header']
    if (this.size === 'small') { wrapperClasses.push('select2-results__header--small') }

    const sorterClasses = ['select2-results__filter']
    if (this.sorter && this.sortOrder !== 0) {
      sorterClasses.push('select2-results__filter-active')
    }

    return $(`
      <div id="select2-results__option-cover-header" class="${wrapperClasses.join(' ')}">
        ${this.header}
      </div>
      `)
  }

  formatOption (state: any) {
    const wrapperClasses = ['select2-results__option-cover']
    if (this.size === 'small') { wrapperClasses.push('select2-results__option-cover--small') }

    const hasDensity = state.density !== null && state.density !== undefined
    const densityOption = hasDensity
      ? `<div class="checklist-dropdown__option-density">${state.density}</div>`
      : ''

    return $(`
      <div id="select2-results__option-cover${state.id}" class="${wrapperClasses.join(' ')}">
        <div class="checklist-dropdown__option-text">${state.text}</div>
        ${densityOption}
      </div>
    `)
  }

  /**
   * onClick: This just handles the popcorn icon of the dropdown as it is not
   * added by select2 component by default
   */
  onClick () {
    this.open = !this.open
  }

  /**
   * onBlur: This just handles the popcorn icon of the dropdown as it is not
   * added by select2 component by default
   */
  onBlur (evt: Event) {
    if (!evt || !evt.target || $(evt.target).length > 0) { return }

    // Check to revert icon or not
    if ($(evt.target).parents('.select2-results__option').length === 0) {
      this.open = false
    }
  }

  /**
   * onSort: Sort handler
   * This just reorders DOM elements under the dropdown
   */
  onSort (sorter: 'density' | 'text' | null) {
    if (!this.sorter || this.sorter !== sorter) {
      this.sorter = sorter
      this.sortOrder = 1
    } else {
      this.sortOrder = (this.sortOrder + 2) % 3 - 1
    }
    const sorterId = this.sorter === 'text' ? this.textSorterId : this.densitySorterId
    if (this.sortOrder === 0) {
      $(`#${sorterId}`).removeClass('.select2-results__filter-active')
      $(`#${sorterId} .select2-results__filter-popcorn`)
        .removeClass('select2-results__filter-popcorn--reversed')
        .addClass('select2-results__filter-popcorn--hidden')
    } else if (this.sortOrder === 1) {
      $(`#${sorterId}`).addClass('.select2-results__filter-active')
      $(`#${sorterId} .select2-results__filter-popcorn`)
        .addClass('select2-results__filter-popcorn--reversed')
        .removeClass('select2-results__filter-popcorn--hidden')
    } else if (this.sortOrder === -1) {
      $(`#${sorterId}`).addClass('.select2-results__filter-active')
      $(`#${sorterId} .select2-results__filter-popcorn`)
        .removeClass('select2-results__filter-popcorn--reversed')
        .removeClass('select2-results__filter-popcorn--hidden')
    }

    this.reorderOptions()
  }

  reorderOptions () {
    for (let i = 1; i < this.sortedOptions.length; i++) {
      const prev = $(`#select2-results__option-cover${this.sortedOptions[i - 1].id}`).parent()
      const next = $(`#select2-results__option-cover${this.sortedOptions[i].id}`).parent()
      next.insertAfter(prev)
    }
  }

  /**
   * onChange: Change handler
   * Submit change event as there has been changes
   */
  onChange () {
    this.$emit('change', {
      id: this.id,
      name: this.name,
      placeholder: this.placeholder,
      value: this.values,
      options: this.options,
      size: this.size
    })
  }

  /**
   * onSelect: Select handler for internally-used Select2 component
   */
  onSelect (evt: Event) {
    this.$emit('select', evt)
  }
}
</script>

<style lang="scss" scoped>
$border-height: 2px;

@mixin min-height($size: 'normal') {
  @if $size == 'normal' {
    min-height: 35px;
  } @else {
    min-height: 25px;
  }
}

.checklist-dropdown {
  position: relative;
  width: 100%;
  @include min-height();
  cursor: pointer;
}

.checklist-dropdown--small {
  @include min-height('small'); }
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
@mixin min-height($size: 'normal') {
  @if $size == 'normal' {
    min-height: 35px;
  } @else {
    min-height: 25px;
  }
}

.select2-container.select2-container--checklist {
  margin: 0;
  position: relative;
}

.select2-container.select2-container--checklist .select2-selection--multiple {
  @include min-height();
  font-size: 0;
  outline: none; }
  .select2-container.select2-container--checklist .select2-selection--multiple .select2-selection__rendered {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    border: none;
    @include typography(md, default, bold);
    color: $colorSecondaryDark1;
    background: $colorSecondaryLight2;
    box-shadow: inset 0px 2px 4px rgba(145, 169, 192, .3);
    border-radius: $border-radius-default;
    padding: 3px 12px;
    margin: 0; }
  .checklist-dropdown--has-selected .select2-container.select2-container--checklist .select2-selection--multiple .select2-selection__rendered {
    background: $colorLineGrey;
  }

.select2-container--checklist .select2-results__option {
  @include typography(md, default);
  @include row--center;
  color: $colorSecondaryLight;
  user-select: none;
  padding: 3px 7px;
  height: 30px;
  -webkit-user-select: none; }
  .select2-container--checklist .select2-results__option:nth-child(odd) {
    background: $colorWhite;
  }
  .select2-container--checklist .select2-results__option:nth-child(even) {
    background: $colorLineGrey;
  }

.select2-container--checklist .select2-search--dropdown {
  display: block;}
  .select2-container--checklist .select2-search--dropdown .select2-search__field {
    box-sizing: border-box; }

.select2-container.select2-container--checklist .select2-search--inline {
  width: 100%;
  @include row;
  align-items: center;
  float: left; }
  .select2-container.select2-container--checklist .select2-search--inline .select2-search__field {
    width: 100% !important;
    @include typography(md);
    color: $colorSecondaryDark1;
    background: transparent;
    box-sizing: border-box;
    border: none;
    font-size: 100%;
    margin: 0;
    padding: 0; }
    .select2-container.select2-container--checklist .select2-search--inline .select2-search__field::placeholder {
      @include typography(md, default);
      color: $colorSecondaryLight; }
    .select2-container.select2-container--checklist .select2-search--inline .select2-search__field::-webkit-search-cancel-button {
      -webkit-appearance: none; }

.select2-container--checklist .select2-selection--multiple {
  background-color: transparent;
  border: none;
  border-radius: $border-radius-default; }
  .select2-container--checklist .select2-selection--multiple .select2-selection__rendered {
    @include min-height();
    @include typography(md, default, bold);
    color: $colorSecondaryDark1;
    background: $colorSecondaryLight2;
    box-shadow: inset 0px 2px 4px rgba(145, 169, 192, .3);
    border-radius: 3px;
    padding: 3px 12px;
    margin: 0; }
    .select2-container--checklist .select2-selection--multiple .select2-selection__rendered li {
      list-style: none; }
  .select2-container--checklist .select2-selection--multiple .select2-selection__placeholder {
    @include typography(lg, default);
    color: $colorSecondaryLight1; }
  .select2-container--checklist .select2-selection--multiple .select2-selection__clear {
    cursor: pointer;
    float: right;
    font-weight: bold; }
  .select2-container--checklist .select2-selection--multiple .select2-selection__choice {
    @include row--center;
    display: inline-flex;
    height: 26px;
    border: none;
    border-radius: $border-radius-default;
    margin: 5px 5px 4px 0;
    padding: 2px 5px;
    @include typography(md, default);
    color: $colorSecondaryDark1;
    background: $colorSecondaryLight2; }
    .select2-container--checklist .select2-selection--multiple .select2-selection__choice .select2-selection__choice__remove {
      color: $colorSecondaryDark1;
      margin-right: 5px;
      @include typography(md, default); }

.select2-container--checklist.select2-container--focus .select2-selection--multiple {
  @include min-height();
  border: none;
  outline: none; }

.select2-container--checklist.select2-container--disabled .select2-selection--multiple {
  @include min-height();
  outline: none; }

.select2-container--checklist .select2-search--dropdown .select2-search__field {
  box-shadow: 0px 10px 60px rgba(11, 36, 72, 0.1), 0px 1px 2px rgba(11, 36, 72, 0.05);
  @include typography(md, headlines);
  letter-spacing: 0.5px;
  color: $colorSecondaryDark1;
  border-radius: $border-radius-default;
  border: 1px solid $colorSecondaryLight1; }
.select2-container--checklist .select2-results > .select2-results__options {
  max-height: 200px;
  overflow-y: auto; }
.select2-container--checklist .select2-results__option--highlighted:nth-child(odd) {
  background: $colorWhite;
}
.select2-container--checklist .select2-results__option--highlighted:nth-child(odd)[aria-selected] {
  font-weight: bold;
  color: $colorSecondaryDark1;
}
.select2-container--checklist .select2-results__option--highlighted:nth-child(even) {
  background: $colorLineGrey;
}
.select2-container--checklist .select2-results__option--highlighted:nth-child(even)[aria-selected] {
  font-weight: bold;
  color: $colorSecondaryDark1;
}
.select2-container--checklist .select2-results__option[aria-selected=true]:nth-child(odd) {
  background: $colorWhite; }
.select2-container--checklist .select2-results__option[aria-selected=true]:nth-child(even) {
  background: $colorLineGrey; }
.select2-container--checklist .select2-results__option--highlighted[aria-selected] {
  font-weight: bold;
  color: $colorSecondaryDark1; }
.select2-container--checklist .select2-results__option--highlighted[aria-selected]:hover {
  background: $colorPrimaryLight2;
}
.select2-container--checklist.select2-container--open .select2-dropdown--above {
  box-shadow: 0px -5px 60px rgba(11, 36, 72, 0.2), 0px 1px 2px rgba(58, 78, 108, 0.05);
  border-bottom: none;
  border-top-left-radius: $border-radius-default;
  border-top-right-radius: $border-radius-default; }
.select2-container--checklist.select2-container--open .select2-dropdown--below {
  box-shadow: 0px 5px 60px rgba(11, 36, 72, 0.2), 0px 1px 2px rgba(58, 78, 108, 0.05);
  border-top: none;
  border-bottom-left-radius: $border-radius-default;
  border-bottom-right-radius: $border-radius-default; }

.select2-container--checklist .select2-results__option-cover {
  @include row--distributed--center;
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
}
.checklist-dropdown__option-text {
  @include row--center;
  @include typography(md, default);
  height: 100%;
  padding: 0 5px;
  color: $colorSecondaryDark1;
  background-color: $colorSecondaryLight3;
  border-radius: $border-radius-default;
  -webkit-font-smoothing: antialiased;
}
.checklist-dropdown__option-density {
  @include typography(md, default, bold);
  color: $colorSecondaryLight;
}
.select2-container--checklist .select2-results__header {
  width: 100%;
  @include typography(sm, default, bold);
  margin: 2px 3px;
  color: $colorSecondaryLight;
}
.select2-container--checklist .select2-results__filter {
  @include row--center;
  position: relative;
  cursor: pointer;
}
.select2-container--checklist .select2-results__filter-active, .select2-results__filter:hover {
  .select2-results__filter-name {
    color: $colorSecondaryDark1;
  }
  .select2-results__filter-popcorn {
    border-top: 5px solid $colorPrimaryDark;
  }
}
.select2-container--checklist .select2-results .select2-results__options {
  max-height: 200px;
}

.checklist-dropdown--small .select2-container.select2-container--checklist .select2-selection--multiple {
  @include min-height('small'); }
  .checklist-dropdown--small .select2-container.select2-container--checklist .select2-selection--multiple .select2-selection__rendered {
    @include typography(md, default, bold); }
  .checklist-dropdown--small .select2-container.select2-container--checklist .select2-search--inline .select2-search__field::placeholder {
    @include typography(md); }

.checklist-dropdown--small .select2-container--checklist .select2-selection--multiple .select2-selection__rendered {
  @include min-height('small'); }
.checklist-dropdown--small .select2-container--checklist .select2-selection--multiple .select2-selection__placeholder {
  @include typography(md, default, bold); }
.checklist-dropdown--small .select2-container--checklist .select2-selection--multiple .select2-selection__choice {
  display: inline-block;
  height: 20px;
  @include typography(sm, default, bold); }
  .checklist-dropdown--small .select2-container--checklist .select2-selection--multiple .select2-selection__choice .select2-selection__choice__remove {
    @include typography(sm, default, bold); }
.checklist-dropdown--small .select2-container--checklist.select2-container--focus .select2-selection--multiple {
  @include min-height('small'); }
.checklist-dropdown--small .select2-container--checklist.select2-container--disabled .select2-selection--multiple {
  @include min-height('small'); }

.select2-container--checklist .select2-results__option-cover--small {
  margin: 0 8px;
}
.select2-container--checklist .select2-results__option-cover--small .checklist-dropdown__option-text {
  @include typography(sm);
}
.select2-container--checklist .select2-results__option-cover--small .checklist-dropdown__option-density {
  @include typography(sm);
}

.select2-container--checklist .select2-results__header--hidden {
  display: none;
}

.select2-container--checklist .select2-results__header--small {
  margin: 1px 8px;
}
.select2-container--checklist .select2-results__header--small .select2-results__filter-name {
  @include typography(sm);
}
.select2-container--checklist .select2-results__header--small .select2-results__filter-popcorn {
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-top: 3px solid $colorPrimaryDark;
}

.checklist-dropdown__error {
  margin-top: 5px;
  @include typography(sm, default, bold);
  color: $colorPink;
}
</style>
