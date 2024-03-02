import { Story } from '@storybook/vue'

import Toggle from './Toggle.vue'

const argTypes = {
  label: { control: 'text' },
  onInput: { action: 'input' },
  value: { control: 'boolean' }
}

const stories = {
  title: 'Common/Toggle/V1',
  component: Toggle,
  argTypes
}

export default stories

const Template: Story = () => ({
  components: { Toggle },
  props: Object.keys(argTypes),
  template: `
    <toggle :value="value" @input="onInput" v-if="label">{{ label }}</toggle>
    <toggle :value="value" @input="onInput" v-else />
  `
})

export const Default: Story = Template.bind({})
Default.args = {
  label: '',
  value: false
}
