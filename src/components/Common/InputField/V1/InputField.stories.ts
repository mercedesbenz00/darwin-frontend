import { action } from '@storybook/addon-actions'

import InputField from './InputField.vue'

const colors = require('@/assets/styles/darwin/variables/colors.module.scss')

const stories = {
  title: 'Common/InputField/Versions/V1',
  component: InputField,
  argTypes: {
    theme: { control: { type: 'radio', options: ['light', 'dark'] } },
    value: { control: 'text' },
    label: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    disabled: { control: 'boolean' },
    id: { control: 'text' },
    name: { control: 'text' },
    type: { control: { type: 'radio', options: ['text', 'number', 'email'] } },
    autocomplete: { control: 'boolean' },
    autoFocus: { control: 'boolean' },
    autofill: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    maxlength: { control: 'number' }
  },
  parameters: {
    backgrounds: {
      default: 'White',
      values: [
        { name: 'White', value: colors.colorWhite },
        { name: 'AliceBlue', value: colors.colorAliceBlue },
        { name: 'AliceShade', value: colors.colorAliceShade },
        { name: 'AliceShadow', value: colors.colorAliceShadow }
      ]
    }
  }
}

export default stories

const buildActions = () => ({
  change: action('change'),
  enter: action('enter'),
  input: action('input')
})

type Args = Record<keyof typeof stories.argTypes, any>

export const Interactive = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { InputField },
  data () { return { actions: buildActions() } },
  template: '<input-field v-bind="$props" v-on="actions"/>'
})

Interactive.args = {
  placeholder: 'This is a placeholder',
  label: 'My Interactive Input',
  id: 'my_custom_id',
  name: 'my_custom_name',
  hint: 'It has a hint'
}

export const DarkTheme = () => ({
  components: { InputField },
  data () {
    return {
      label: 'Some label',
      theme: 'dark',
      placeholder: 'Some placeholder'
    }
  },
  template: '<input-field v-bind="$data" />'
})

export const LightTheme = () => ({
  components: { InputField },
  data () {
    return {
      label: 'Some label',
      theme: 'light',
      placeholder: 'Some placeholder'
    }
  },
  template: '<input-field v-bind="$data" />'
})

export const WithValue = () => ({
  components: { InputField },
  data () {
    return {
      label: 'Some label',
      value: 'Some value'
    }
  },
  template: '<input-field v-bind="$data" />'
})

export const WithError = () => ({
  components: { InputField },
  data () {
    return {
      label: 'Some label',
      error: 'Some error',
      value: 'Some value'
    }
  },
  template: '<input-field v-bind="$data" />'
})

export const WithModifier = () => ({
  components: { InputField },
  data () {
    return {
      label: 'Some label',
      value: 'Some value'
    }
  },
  template: `
    <input-field v-bind="$data">
      <template #modifier>This is a modifier</template>
    </input-field>
  `
})

export const WithAdvisor = () => ({
  components: { InputField },
  data () {
    return {
      label: 'Some label',
      value: 'Some value'
    }
  },
  template: `
    <input-field v-bind="$data">
      <template #advisor>This is an advisor</template>
    </input-field>
  `
})
