import { Meta, Story } from '@storybook/vue'

import TabItem from '@/uiKit/TabStack/TabItem/TabItem.vue'

import { TabItemProps, TabSize } from './types'

export default {
  title: 'uiKit/TabItem',
  argTypes: {
    label: {
      control: 'text',
      description: 'Label to display',
      table: {
        type: { summary: 'String' },
        defaultValue: { summary: 'TabItem' }
      }
    },
    size: {
      control: {
        type: 'select',
        options: Object.entries(TabSize).map((val) => val[1])
      },
      description: 'The size of the tab.',
      table: {
        type: { summary: 'TabSize' },
        defaultValue: { summary: 'TabSize.SMALL' }
      }
    }
  }
} as Meta<typeof TabItem>

const Template: Story<TabItemProps> = (args, { argTypes }) => ({
  components: { TabItem },
  props: Object.keys(argTypes),
  template: `
    <div style="display:flex;align-items: center">
      <tab-item v-bind="$props" />
      <tab-item v-bind="$props" />
    </div>
  `
})

export const Default = Template.bind({})
Default.args = {
  id: 'abc',
  label: 'Overview',
  size: TabSize.SMALL,
}
