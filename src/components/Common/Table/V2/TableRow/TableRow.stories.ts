import { Meta, Story } from '@storybook/vue'

import TableItem from '@/components/Common/Table/V2/TableItem/TableItem.vue'

import TableRow from './TableRow.vue'

export default {
  title: 'Common/Table/V2/TableRow',
  argTypes: {}
} as Meta<typeof TableRow>

export const Default: Story = (args, { argTypes }) => ({
  components: { TableRow, TableItem },
  props: Object.keys(argTypes),
  template: `
    <div style="width:fit-content">
      <table-row v-bind="$props">
        <table-item :min-column-size="100">
          <p>...content</p>
        </table-item>
        <table-item :min-column-size="100">
          <p>...content</p>
        </table-item>
        <table-item :min-column-size="100">
          <p>...content</p>
        </table-item>
        <table-item :min-column-size="100">
          <p>...content</p>
        </table-item>
        <table-item :min-column-size="100">
          <p>...content</p>
        </table-item>
      </table-row>
    </div>
  `
})

Default.storyName = 'Table Row'
Default.args = {}
