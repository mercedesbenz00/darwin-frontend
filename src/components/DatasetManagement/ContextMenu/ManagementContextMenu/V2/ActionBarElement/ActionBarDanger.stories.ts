import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import ActionBarDanger from './ActionBarDanger.vue'

export default {
  title: 'Common/ActionBar/ActionBarElement/Danger'
} as Meta<typeof ActionBarDanger>

export const Default: Story = (args, { argTypes }) => ({
  components: { ActionBarDanger },
  props: Object.keys(argTypes),
  methods: { click: action('click') },
  template: `
    <action-bar-danger @click='click' />
  `
})
