import { Meta, Story } from '@storybook/vue'

import { TabSize } from './TabItem/types'
import TabStack from './TabStack.vue'
import {TabStackProps } from './types'

export default {
  title: 'Common/TabStack'
} as Meta<typeof TabStack>

export const Default: Story<TabStackProps> = (args, { argTypes }) => ({
  components: { TabStack },
  props: Object.keys(argTypes),
  template: `
    <div style="background:#F4F5F6;width:100%;height:100vh;padding-top: 12px">
      <tab-stack v-bind="$props" />
      <div style="width: 100%;background:#FFF;height:100%"></div>
    </div>
  `
})

Default.storyName = 'TabStack'
Default.args = {
  size: TabSize.SMALL,
  activeTab: 0,
  tabs: [
    {
      id: 'a1',
      label: 'Data',
    },
    {
      id: 'a2',
      label: 'Quality',
    },
    {
      id: 'a3',
      label: 'Settings',
    },
    {
      id: 'a4',
      label: 'Classes',
    }
  ]
}
