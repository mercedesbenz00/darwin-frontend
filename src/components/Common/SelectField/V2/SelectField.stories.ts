import SelectField from './SelectField.vue'

const stories = {
  title: 'Common/SelectFieldV2',
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
  options: [
    { id: '1', text: 'normal item' },
    { id: '2', text: 'selected item', selected: true },
    { id: '3', text: 'active item', active: true },
    { id: '4', text: 'disabled item', selected: false, disabled: true },
  ],
}

export const Default = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { SelectField },
  template: `
    <select-field
      v-bind="$props"
      v-on="$listeners"
      style="width: fit-content; margin-left: 100px;"
    />
  `
})

Default.args = defaultArgs

const longTextArgs: Args = {
  label: 'Test field - and a verylooooooooootext',
  value: 'value',
  required: true,
  options: [
    { id: '1', text: 'normal item - and a verylooooooooootext' },
    { id: '2', text: 'selected item - and a verylooooooooootext', selected: true },
    { id: '3', text: 'active item - and a verylooooooooootext', active: true },
    { id: '4', text: 'disabled item - and a verylooooooooootext', selected: false, disabled: true },
  ],
}

export const LongText = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { SelectField },
  template: `
    <select-field
      v-bind="$props"
      v-on="$listeners"
      style="width: fit-content; margin-left: 100px;"
    />
  `
})

LongText.args = longTextArgs

export const CustomIcon = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { SelectField },
  template: `
    <select-field
      v-bind="$props"
      v-on="$listeners"
      style="width: fit-content; margin-left: 100px;"
    >
      <template #icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
    </select-field>
  `
})

CustomIcon.args = defaultArgs

export const CustomLabel = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { SelectField },
  template: `
    <select-field
      v-bind="$props"
      v-on="$listeners"
      style="width: fit-content; margin-left: 100px;"
    >
      <template #label>
        Custom label
      </template>
    </select-field>
  `
})

CustomLabel.args = defaultArgs

export const CustomIconAndLabel = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { SelectField },
  template: `
    <select-field
      v-bind="$props"
      v-on="$listeners"
      style="width: fit-content; margin-left: 100px;"
    >
      <template #label>
        Custom label
      </template>
      <template #icon>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.0001 5.9999V14.0001" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
          <path
            d="M5.9999 10.0001H14.0001" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </template>
    </select-field>
  `
})

CustomIconAndLabel.args = defaultArgs
