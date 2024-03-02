import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import TableHeader from './TableHeader.vue'
import { TableHeaderProps } from './types'

export default {
  title: 'Common/Table/V2/TableHeader'
} as Meta<typeof TableHeader>

export const DefaultStory: Story<TableHeaderProps> = (arg, { argTypes }) => ({
  components: { TableHeader },
  props: Object.keys(argTypes),
  methods: { onResize: action('on-resize') },
  template: `
    <table-header v-bind="$props" @on-resize="onResize" />
  `
})

DefaultStory.storyName = 'with Data'
DefaultStory.args = {
  items:
    [
      {
        id: 'name',
        label: 'Name',
        minColumnSize: 312,
        tableId: '123',
        totalItems: 6
      },
      {
        id: 'status',
        label: 'Status',
        minColumnSize: 200,
        tableId: '123',
        totalItems: 6
      },
      {
        id: 'tags',
        label: 'Tags',
        minColumnSize: 312,
        tableId: '123',
        totalItems: 6
      },
      {
        id: 'created_at',
        label: 'Date Created',
        minColumnSize: 312,
        tableId: '123',
        totalItems: 6
      },
      {
        id: 'updated_at',
        label: 'Date Modified',
        minColumnSize: 312,
        tableId: '123',
        totalItems: 6
      },
      {
        id: 'byte_size',
        label: 'File Size',
        minColumnSize: 136,
        tableId: '123',
        totalItems: 6
      }
    ]
}
