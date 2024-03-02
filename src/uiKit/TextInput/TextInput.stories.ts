import { Meta, Story } from '@storybook/vue'

import { TextInput, TextInputProps } from '.'

export default {
  title: 'uIKit/InputField/Versions/V2'
} as Meta<typeof TextInput>

const InputFieldTemplate: Story<TextInputProps> = (args, { argTypes }) => ({
  components: { TextInput },
  props: Object.keys(argTypes),
  template: '<TextInput v-bind="$props" />'
})

export const Default = InputFieldTemplate.bind({})
Default.args = {
  disabled: false,
  placeholder: 'This is a placeholder.'
}

export const Disabled = InputFieldTemplate.bind({})
Disabled.args = {
  disabled: true,
  placeholder: 'This is a placeholder.'
}

export const Error = InputFieldTemplate.bind({})
Error.args = {
  disabled: false,
  placeholder: 'This is a placeholder.',
  error: 'There is error'
  }

export const Multiple = InputFieldTemplate.bind({})
Multiple.args = {
  disabled: false,
  placeholder: 'Add another value.',
  items: [{ label: 'foo' }],
  multiple: true
}
