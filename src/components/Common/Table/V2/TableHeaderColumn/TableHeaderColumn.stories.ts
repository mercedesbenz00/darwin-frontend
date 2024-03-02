import { Meta, Story } from '@storybook/vue'

import {
  TableHeaderItem
} from '@/components/Common/Table/V2/TableHeader/types'

import TableHeaderColumn from './TableHeaderColumn.vue'

export default {
  title: 'Common/Table/V2/TableHeaderColumn',
  argTypes: {
    label: {
      control: 'string',
      description: 'Displayed column label',
      table: {
        type: { summary: 'String' },
        defaultValue: { summary: '-' }
      }
    },
    minColumnSize: {
      control: 'number',
      description: 'Starter size of column inside table',
      table: {
        type: { summary: 'Number' },
        defaultValue: { summary: '-' }
      }
    },
    position: {
      control: 'number',
      // eslint-disable-next-line max-len
      description: 'Position of the column inside the table. Indicator for visual zIndex and for manipulating TableItems',
      table: {
        type: { summary: 'Number' },
        defaultValue: { summary: '0' }
      }
    },
    resizeable: {
      control: 'boolean',
      description: 'Disables or enables resizeability for column',
      table: {
        type: { summary: 'Boolean' },
        defaultValue: { summary: 'false' }
      }
    }
  }
} as Meta<typeof TableHeaderColumn>

const Template: Story<TableHeaderItem & { position: number }> = (arg, { argTypes }) => ({
  components: { TableHeaderColumn },
  props: Object.keys(argTypes),
  template: `
    <div style="width:500px;height:500px;background:hsla(212, 8%, 94%, 1);">
      <table-header-column v-bind="$props" />
    </div>
  `
})

export const DefaultStory = Template.bind({})

DefaultStory.storyName = 'with resize action'
DefaultStory.args = {
  label: 'Name',
  sortAction: (): void => {},
  minColumnSize: 214,
  position: 2,
  resizeable: true
}

export const AltStory = Template.bind({})
AltStory.storyName = 'w/o resize action'
AltStory.args = {
  label: 'Name',
  minColumnSize: 214,
  position: 2,
  resizeable: true
}
