import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import colors from '@/assets/styles/darwin/variables/colors.module.scss'

import Timer from './Timer.vue'

export default {
  title: 'Workview/Common/Timer',
  argTypes: {
    completesAt: {
      control: 'number',
      description: 'Timestamp supposed end of the timer'
    },
    dark: {
      control: 'boolean'
    },
    showCancel: {
      control: 'boolean'
    }
  },
  parameters: {
    backgrounds: {
      default: 'AliceShadow',
      values: [
        { name: 'White', value: colors.colorWhite },
        { name: 'AliceBlue', value: colors.colorAliceBlue },
        { name: 'AliceShade', value: colors.colorAliceShade },
        { name: 'AliceShadow', value: colors.colorAliceShadow }
      ]
    }
  }
} as Meta<typeof Timer>

type ArgTypes = {
  completesAt: number,
  dark?: boolean,
  showCancel?: boolean
}

// TIMER DEFAULT
export const Default: Story<ArgTypes> = (args, { argTypes }) => ({
  components: { Timer },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<div style="color: green"><timer v-bind="$props"></timer></div>'
})

Default.args = {
  completesAt: Math.ceil((Date.now() + 10000) / 1000),
  dark: false,
  showCancel: true
}
