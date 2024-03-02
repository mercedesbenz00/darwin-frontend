import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'
import { RecycleScroller } from 'vue-virtual-scroller'

import { BottomBar, BottomBarItem } from '@/components/WorkView/BottomBar'
import { bottomBarItems } from '@/storybook/fixtures/bottomBarItems'

export default {
  title: 'WorkView/BottomBar',
  argTypes: {
    items: {
      control: {
        type: 'boolean'
      }
    },
    selectedItem: {
      control: {
        type: 'number',
        value: 52
      }
    }
  }
} as Meta<typeof BottomBar>

type Props = {
  items: BottomBarItem[]
  selectedItem: BottomBarItem
}

// DEFAULT
export const Default: Story<Props> = (args, { argTypes }) => ({
  components: { BottomBar, RecycleScroller },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<bottom-bar v-bind="$props" />'
})
Default.args = {
  items: bottomBarItems,
  selectedItem: bottomBarItems[0]
}
