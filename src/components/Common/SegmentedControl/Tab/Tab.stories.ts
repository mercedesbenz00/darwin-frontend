import { Meta, Story } from '@storybook/vue'

import { Tab as Props } from '@/components/Common/SegmentedControl/types'

import Tab from './Tab.vue'

export default {
  title: 'Common/SegmentedControl/Tab'
} as Meta<typeof Tab>

export const Default: Story<Props> = (args, { argTypes }) => ({
  components: { Tab },
  props: Object.keys(argTypes),
  template: `
    <div style='width: 80px'>
      <tab v-bind="$props" />
    </div>
  `
})

Default.storyName = 'Tab'
Default.args = {
  id: '1',
  label: 'Label',
  iconName: null
}
