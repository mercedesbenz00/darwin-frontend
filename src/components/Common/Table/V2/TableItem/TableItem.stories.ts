import { Meta, Story } from '@storybook/vue'

import TableItem from './TableItem.vue'

export default {
  title: 'Common/Table/V2/TableItem'
} as Meta<typeof TableItem>

export const Default: Story = (args, { argTypes }) => ({
  components: { TableItem },
  props: Object.keys(argTypes),
  template: `
    <table-item v-bind="$props">
      <h1>...Content</h1>
    </table-item>
  `
})

Default.storyName = 'Table item'
Default.args = {}
