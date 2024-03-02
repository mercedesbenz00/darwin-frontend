<template>
  <div class="color-map-dropdown">
    <div class="dropdown">
      <Select2
        v-model="sel"
        :options="options"
        :settings="settings"
        @select="onSelect($event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import Select2 from '@/components/Common/Select2.vue'
import { ColorMap } from '@/engineCommon/imageManipulation'

export type ColorMapDropdownOption = {
  id: ColorMap
  icon?: string
  text: string
}

@Component({
  name: 'color-map-dropdown',
  components: { Select2 }
})
export default class ColorMapDropdown extends Vue {
  @Prop({ required: true })
  value!: ColorMap

  get options (): ColorMapDropdownOption[] {
    return [
      { id: 'default', text: 'Raw (default)' },
      { id: 'bone', text: 'Bone', icon: '/static/imgs/color-maps/bone.svg' },
      { id: 'jet', text: 'Jet', icon: '/static/imgs/color-maps/jet.svg' },
      { id: 'hot', text: 'Hot', icon: '/static/imgs/color-maps/hot.svg' },
      { id: 'seismic', text: 'Seismic', icon: '/static/imgs/color-maps/seismic.svg' },
      { id: 'paired', text: 'Paired', icon: '/static/imgs/color-maps/paired.svg' }
    ]
  }

  get sel () {
    return this.value
  }

  set sel (val) {
    this.$emit('input', val)
    this.$emit('change', val)
  }

  get settings () {
    return {
      minimumResultsForSearch: -1,
      templateResult: this.formatTemplate.bind(this),
      templateSelection: this.formatTemplate.bind(this),
      theme: 'color-map',
      width: '100%'
    }
  }

  formatTemplate (state: ColorMapDropdownOption) {
    let iconHtml = ''
    if (state.icon) {
      iconHtml = `<img src=${state.icon} class="select2-results__option__icon">`
    }
    // eslint-disable-next-line
    return $(`
    <div class="select2-results__option-cover">
      <span class="select2-results__option__text">${state.text}</span> ${iconHtml}
    </div>
    `)
  }

  onSelect (option: ColorMapDropdownOption) {
    this.sel = option.id
  }
}
</script>

<style lang="scss" scoped>
.color-map-dropdown {
  position: relative;
  margin: 0 -10px;
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
$height: 36px;

.select2-container.select2-container--color-map {
  margin: 0;
  position: relative;
}
  .select2-container.select2-container--color-map .select2-selection--single {
    height: $height;
    outline: none;
    border: none;
    background-color: transparent;
    border-radius: $border-radius-default;
    overflow: hidden;
  }
    .select2-container.select2-container--color-map .select2-selection--single .select2-selection__rendered {
      border: none;
      @include typography(md-1, default);
      color: $color90Black;
      background: $colorAliceBlue;
      box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);
      padding: 9px; }
    .select2-container.select2-container--color-map .select2-selection--single .select2-selection__rendered .select2-results__option-cover {
      @include row;
      align-items: center;
    }
      .select2-container.select2-container--color-map .select2-selection--single .select2-selection__rendered .select2-results__option-cover .select2-results__option__text {
        flex: 1;
      }

      .select2-container.select2-container--color-map .select2-selection--single .select2-selection__rendered .select2-results__option-cover .select2-results__option__icon {
        width: 34px;
        margin-right: 25px;
      }
    .select2-container.select2-container--color-map.select2-container--focus .select2-selection--single .select2-selection__rendered {
      padding: 9px; }
.select2-container.select2-container--color-map .select2-dropdown {
  background: $colorWhite;
  border: none;
  overflow: hidden;
  z-index: 1051; }

.select2-container--color-map .select2-results__option {
  @include typography(md, default);
  background: $colorWhite;
  color: $colorSecondaryLight;
  user-select: none;
  -webkit-user-select: none; }
.select2-container--color-map .select2-results__option .select2-results__option-cover {
  margin: 8px 10px;
  @include row;
  align-items: center;
}
  .select2-container--color-map .select2-results__option .select2-results__option-cover .select2-results__option__text {
    flex: 1;
  }
  .select2-container--color-map .select2-results__option .select2-results__option-cover .select2-results__option__icon {
    width: 34px;
    margin-right: 5px;
  }
.select2-container--color-map .select2-search--dropdown {
  padding: 4px; }
  .select2-container--color-map .select2-search--dropdown .select2-search__field {
    padding: 4px;
    box-sizing: border-box; }
.select2-container--color-map .select2-selection--single {
  background-color: transparent;
  border: none;
  border-radius: $border-radius-default; }
  .select2-container--color-map .select2-selection--single .select2-selection__rendered {
    color: $colorSecondaryDark1;
    height: $height;
    line-height: normal; }
  .select2-container--color-map .select2-selection--single .select2-selection__clear {
    cursor: pointer;
    float: right;
    font-weight: bold; }
  .select2-container--color-map .select2-selection--single .select2-selection__placeholder {
    @include typography(md-1, default);
    color: $colorSecondaryLight1; }
  .select2-container--color-map .select2-selection--single .select2-selection__arrow {
    width: 14px;
    height: 26px;
    position: absolute;
    top: 0;
    right: 9px; }
    .select2-container--color-map .select2-selection--single .select2-selection__arrow b {
      position: absolute;
      border-left: 7px solid transparent !important;
      border-right: 7px solid transparent !important;
      border-top: 7px solid $colorPrimaryLight !important;
      border-bottom: none !important;
      left: auto;
      top: 55%;
      margin: 0;
      height: 0;
      width: 0; }
  .select2-container--color-map.select2-container--disabled .select2-selection--single .select2-selection__arrow {
    display: none;
  }
.select2-container--color-map.select2-container--open .select2-selection--single .select2-selection__rendered {
  padding: 9px; }
.select2-container--color-map.select2-container--disabled .select2-selection--single {
  background-color: inherit;
  cursor: default; }
  .select2-container--color-map.select2-container--disabled .select2-selection--single .select2-selection__clear {
    display: none; }
.select2-container--color-map.select2-container--open .select2-selection--single .select2-selection__arrow b {
  border: none;
  border-left: 7px solid transparent !important;
  border-right: 7px solid transparent !important;
  border-top: none !important;
  border-bottom: 7px solid $colorPrimaryLight !important; }
.select2-container--color-map .select2-search--dropdown .select2-search__field {
  box-shadow: 0px 10px 60px rgba(11, 36, 72, 0.1), 0px 1px 2px rgba(11, 36, 72, 0.05);
  @include typography(md, headlines);
  letter-spacing: 0.5px;
  color: $colorSecondaryDark1;
  border-radius: 5px;
  border: 1px solid $colorSecondaryLight1; }
.select2-container--color-map .select2-results > .select2-results__options {
  max-height: 200px;
  overflow-y: auto; }
.select2-container--color-map .select2-results__option--highlighted:nth-child(odd) {
  background: $colorGriteDark;
}
.select2-container--color-map .select2-results__option--highlighted:nth-child(odd)[aria-selected] {
  font-weight: bold;
  color: $colorSecondaryDark1;
}
.select2-container--color-map .select2-results__option--highlighted:nth-child(even) {
  background: $colorWhite;
}
.select2-container--color-map .select2-results__option--highlighted:nth-child(even)[aria-selected] {
  font-weight: bold;
  color: $colorSecondaryDark1;
}
.select2-container--color-map .select2-results__option[aria-selected=true]:nth-child(odd) {
  background: $colorGriteDark; }
.select2-container--color-map .select2-results__option[aria-selected=true]:nth-child(even) {
  background: $colorWhite; }
.select2-container--color-map .select2-results__option--highlighted[aria-selected] {
  background: $colorAliceBlue;
  font-weight: bold;
  color: $colorSecondaryDark1; }
.select2-container--color-map .select2-results__option--highlighted[aria-selected]:hover {
  background: $colorAliceBlue;
}
.select2-container--color-map.select2-container--open .select2-dropdown--above {
  box-shadow: 0px -5px 60px rgba(11, 36, 72, 0.2), 0px 1px 2px rgba(58, 78, 108, 0.05);
  border-bottom: none;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px; }
.select2-container--color-map.select2-container--open .select2-dropdown--below {
  box-shadow: 0px 5px 60px rgba(11, 36, 72, 0.2), 0px 1px 2px rgba(58, 78, 108, 0.05);
  border-top: none;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px; }
</style>
