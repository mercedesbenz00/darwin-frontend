import { Meta, Story } from '@storybook/vue'

import TableItemMenu from './TableItemMenu.vue'

export default {
  title: 'Common/Table/V2/TableItemMenu'
} as Meta<typeof TableItemMenu>

export const Default: Story = (args, { argTypes }) => ({
  components: { TableItemMenu },
  props: Object.keys(argTypes),
  template: `
    <table-item-menu v-bind="$props" />
  `
})

Default.storyName = 'TableItemMenu'
Default.args = {}
