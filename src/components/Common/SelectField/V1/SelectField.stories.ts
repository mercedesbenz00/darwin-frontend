import SelectField from './SelectField.vue'

const stories = {
  title: 'Common/SelectField',
  component: SelectField,
  argTypes: {
    label: { control: 'string' },
    value: { control: 'object' },
    options: { control: 'object' },
    required: { control: 'boolean' }
  }
}

export default stories

type Args = Record<keyof typeof stories.argTypes, any>

const defaultArgs: Args = {
  label: 'Test field',
  value: 'value',
  required: true,
  options: ['value', 'value 1', 'value 2']
}

export const Interactive = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { SelectField },
  template: `
    <select-field
      v-bind="$props"
      v-on="$listeners"
    />
  `
})

Interactive.args = defaultArgs
