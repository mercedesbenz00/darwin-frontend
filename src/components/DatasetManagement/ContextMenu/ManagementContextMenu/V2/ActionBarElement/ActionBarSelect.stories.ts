import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import ActionBarSelect from './ActionBarSelect.vue'

export default {
  title: 'Common/ActionBar/ActionBarElement/Select',
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Activates checkbox and changes appearance',
      defaultValue: { summary: 'false' }
    }
  }
} as Meta<typeof ActionBarSelect>

export const Default: Story = (args, { argTypes }) => ({
  components: { ActionBarSelect },
  props: Object.keys(argTypes),
  methods: { click: action('click') },
  template: `
    <action-bar-select v-bind="$props" @click='click' />
  `
})

Default.storyName = 'ActionBarSelect'
Default.args = {
  active: false
}
