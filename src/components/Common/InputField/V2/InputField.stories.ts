import { Meta, Story } from '@storybook/vue'

import { InputField, InputFieldProps } from '.'

export default {
  title: 'Common/InputField/Versions/V2'
} as Meta<typeof InputField>

const InputTemplate: Story<InputFieldProps> = (args, { argTypes }) => ({
  components: { InputField },
  props: Object.keys(argTypes),
  template: '<input-field v-bind="$props" />'
})

export const Default = InputTemplate.bind({})
Default.args = {
  disabled: false,
  placeholder: 'This is a placeholder.'
}

export const Disabled = InputTemplate.bind({})
Disabled.args = {
  disabled: true,
  placeholder: 'This is a placeholder.'
}

export const Error = InputTemplate.bind({})
Error.args = {
  disabled: false,
  placeholder: 'This is a placeholder.',
  error: 'There is error'
  }

export const Multiple = InputTemplate.bind({})
Multiple.args = {
  disabled: false,
  placeholder: 'Add another value.',
  items: [{ label: 'foo' }],
  multiple: true
}
