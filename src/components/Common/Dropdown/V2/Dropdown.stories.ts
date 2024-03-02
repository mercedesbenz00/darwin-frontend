import { action } from '@storybook/addon-actions'
import Vue from 'vue'

import { slider } from '@/storybook/controls/slider'
import { Modal, ModalWithScroll } from '@/storybook/decorators'

import Dropdown from './Dropdown.vue'

const stories = {
  title: 'Common/Dropdown',
  component: Dropdown,
  argTypes: {
    dropdownClassName: { control: 'text' },
    value: { control: 'text' },
    options: { control: 'array' },
    disabled: { control: 'boolean' },
    clearable: { control: 'boolean' },
    searchable: { control: 'boolean' },
    multiple: { control: 'boolean' },
    placeholder: { control: 'text' },
    clearSearchOnSelect: { control: 'boolean' },
    closeOnSelect: { control: 'boolean' },
    label: { control: 'text' },
    autocomplete: { control: { type: 'radio', options: ['on', 'off'] } },
    taggable: { control: 'boolean' },
    pushTags: { control: 'boolean' },
    filterable: { control: 'boolean' },
    noDrop: { control: 'boolean' },
    inputId: { control: 'boolean' },
    dir: { control: { type: 'radio', options: ['auto', 'ltr', 'rtl'] } },
    selectOnTab: { control: 'boolean' },
    appendToBody: { control: 'boolean' },
    theme: { control: { type: 'radio', options: ['light', 'dark'] } }
  }
}

export default stories

const buildActions = () => ({
  input: action('input'),
  'option:selecting': action('option:selecting'),
  'option:selected': action('option:selected'),
  'option:deselecting': action('option:deselecting'),
  'option:deselected': action('option:deselected'),
  'option:created': action('option:created'),
  'search:blur': action('search:blur'),
  'search:focus': action('search:focus')
})

type Args = Record<keyof typeof stories.argTypes, any>

const baseArgs: Args = {
  appendToBody: false,
  autocomplete: 'off',
  clearable: true,
  clearSearchOnSelect: true,
  closeOnSelect: true,
  dir: 'auto',
  disabled: false,
  dropdownClassName: 'dropdown-storybook',
  filterable: true,
  inputId: null,
  label: null,
  multiple: false,
  noDrop: false,
  options: ['Option1', 'Option2', 'Option3'],
  placeholder: null,
  pushTags: false,
  searchable: true,
  selectOnTab: false,
  taggable: false,
  theme: 'dark',
  value: null
}

export const Interactive = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { Dropdown },
  data () { return { actions: buildActions() } },
  template: '<dropdown v-bind="$props" v-on="actions"/>'
})

Interactive.args = { ...baseArgs }

type StoryConfig = { argTypes: typeof stories.argTypes }

export const LimitedContainerWidth = (args: Args, { argTypes }: StoryConfig) => Vue.extend({
  components: { Dropdown },
  props: Object.keys(argTypes),
  data () {
    return {
      actions: buildActions()
    }
  },
  computed: {
    style: {
      get (): Record<string, string> {
        return {
          width: `${this.width}px`,
          display: 'grid',
          gap: '.5em'
        }
      }
    }
  },
  template: `
    <div :style=style>
      <div>Be sure to open these</div>
      <dropdown v-bind="$props" v-on="actions"/>
      <dropdown v-bind="{...$props, value: shortValue }" v-on="actions"/>
    </div>
  `
})

LimitedContainerWidth.argTypes = {
  ...stories.argTypes,
  width: slider(0, 500)
}
LimitedContainerWidth.args = {
  width: 200,
  ...baseArgs,
  value: 'SingleLongWordToSeeHowEllipsisWorks',
  shortValue: 'Short value',
  options: [
    'FirstSingleLongOptionToSeeHowEllipsisWorks',
    'SecondSingleLongOptionToSeeHowEllipsisWorks',
    'Short one'
  ]
}

export const WithPlaceholder = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { Dropdown },
  data () { return { actions: buildActions() } },
  template: '<dropdown v-bind="$props" v-on="actions"/>'
})
WithPlaceholder.args = { ...baseArgs, placeholder: 'This is a placeholder' }

export const InAModal = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { Dropdown },
  data () { return { actions: buildActions() } },
  template: '<dropdown v-bind="$props" v-on="actions"/>'
})
InAModal.args = { ...baseArgs, appendToBody: true }
InAModal.decorators = [Modal]

export const InAModalWithScroll = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { Dropdown },
  data () { return { actions: buildActions() } },
  template: '<dropdown v-bind="$props" v-on="actions"/>'
})

InAModalWithScroll.args = { ...baseArgs, appendToBody: true }
InAModalWithScroll.decorators = [ModalWithScroll]
