import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'
import { v4 } from 'uuid'

import SegmentedControl from './SegmentedControl.vue'
import { SegmentedControl as Types, SegmentedControlVariant, Tab as TabTypes } from './types'

export default {
  title: 'Common/SegmentedControl'
} as Meta<typeof SegmentedControl>

const Template: Story<Types> = (args, { argTypes }) => ({
  components: { SegmentedControl },
  props: Object.keys(argTypes),
  methods: { tabChange: action('tab-change') },
  template: `
    <div style='width: 50%'>
      <segmented-control v-bind='$props' @tab-change='tabChange' />
    </div>
  `
})

const buildSegmentedTab = (options?: Partial<TabTypes>) => ({
  id: v4(),
  label: 'Test',
  iconName: null,
  ...options
})

const iconTabs = [
  buildSegmentedTab({ iconName: 'icon-mono-idle' }),
  buildSegmentedTab({ iconName: 'icon-mono-idle' })
]

const iconTabsNoLabel = [
  buildSegmentedTab({ iconName: 'icon-mono-idle', label: null }),
  buildSegmentedTab({ iconName: 'icon-mono-idle', label: null })
]

const tabs = [
  buildSegmentedTab(),
  buildSegmentedTab(),
  buildSegmentedTab(),
  buildSegmentedTab()
]

const tabStack = [
  buildSegmentedTab(),
  buildSegmentedTab(),
  buildSegmentedTab(),
  buildSegmentedTab(),
  buildSegmentedTab(),
  buildSegmentedTab(),
  buildSegmentedTab(),
  buildSegmentedTab()
]

export const Default = Template.bind({})
Default.storyName = 'XS'
Default.args = {
  id: '123',
  variant: SegmentedControlVariant.SMALL,
  activeIndex: 0,
  tabs: Array.from(tabs)
}

export const Large = Template.bind({})
Large.storyName = 'LG'
Large.args = {
  id: '123',
  variant: SegmentedControlVariant.LARGE,
  activeIndex: 0,
  tabs: Array.from(tabs)
}

export const LessTabs = Template.bind({})
LessTabs.storyName = 'less tabs'
LessTabs.args = {
  id: '123',
  variant: SegmentedControlVariant.SMALL,
  activeIndex: 0,
  tabs: Array.from(tabs).splice(1, 2)
}

export const MoreTabs = Template.bind({})
MoreTabs.storyName = 'multiple tabs'
MoreTabs.args = {
  id: '123',
  variant: SegmentedControlVariant.SMALL,
  activeIndex: 0,
  tabs: Array.from(tabStack)
}

export const Icons = Template.bind({})
Icons.storyName = 'icon tabs'
Icons.args = {
  id: '123',
  variant: SegmentedControlVariant.SMALL,
  activeIndex: 0,
  tabs: Array.from(iconTabs)
}

export const NoLabels = Template.bind({})
NoLabels.storyName = 'icon tabs no label'
NoLabels.args = {
  id: '123',
  variant: SegmentedControlVariant.SMALL,
  activeIndex: 0,
  tabs: Array.from(iconTabsNoLabel)
}
