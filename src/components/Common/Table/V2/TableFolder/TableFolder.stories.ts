import { Meta, Story } from '@storybook/vue'
import { v4 } from 'uuid'

import { buildDatasetFolderPayload } from 'test/unit/factories'

import TableItem from '@/components/Common/Table/V2/TableItem/TableItem.vue'
import TableRow from '@/components/Common/Table/V2/TableRow/TableRow.vue'

import TableFolder from './TableFolder.vue'
import { TableFolderProps } from './types'

export default {
  title: 'Common/Table/V2/TableFolder',
  argTypes: {}
} as Meta<typeof TableFolder>

export const Default: Story<TableFolderProps> = (args, { argTypes }) => ({
  components: { TableFolder, TableRow, TableItem },
  props: Object.keys(argTypes),
  template: `
    <div style="display: block;width: 500px;height: fit-content">
      <table-folder v-bind='$props'>
        <table-row v-bind="$props" v-for='(index) in [0, 1, 2, 3, 4]' :key='index'>
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
      </table-folder>
    </div>
  `
})

Default.storyName = 'Table Folder'
Default.args = {
  tableId: v4(),
  readonly: false,
  urlPrefix: null,
  data: buildDatasetFolderPayload()
}
