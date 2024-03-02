import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import {
  BottomDrawerToggleButton
} from '@/components/WorkView/BottomDrawer/components/BottomDrawerToggleButton'

export default {
  title: 'WorkView/BottomDrawer/BottomDrawerToggleButton',
  argTypes: {}
} as Meta<typeof BottomDrawerToggleButton>

type Props = {}

// DEFAULT
export const Default: Story<Props> = (args, { argTypes }) => ({
  components: { BottomDrawerToggleButton },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <div style="position: relative;
                margin-top: 40px;
                height: 40px;
                width: 200px;
                background-color: grey">
      <bottom-drawer-toggle-button
        v-bind="$props"
        style="background-color: green"
      />
      <p style="line-height: 40px;
                text-align:center;
                color: white;"
      >Hover the green area to show the tooltip</p>
    </div>
    `
})
