import { Meta, Story } from '@storybook/vue'

import { CircleSpinner } from '@/components/Common/LoadingIndicators'
import {
  CircleSpinnerProps
} from '@/components/Common/LoadingIndicators/PlainLoaders/CircleSpinner/types'

export default {
  title: 'LoadingIndicators/CircleSpinner',
  argTypes: {
    dark: {
      control: 'boolean',
      description: 'Defines the variant for the component',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    width: {
      control: 'number',
      description: 'Defines the width for the component',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '50' }
      }
    },
    height: {
      control: 'number',
      description: 'Defines the height for the component',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '50' }
      }
    }
  }
} as Meta<typeof CircleSpinner>

export const CircleSpinnerTemplate: Story<CircleSpinnerProps> = (args, { argTypes }) => ({
  components: { CircleSpinner },
  props: Object.keys(argTypes),
  template: "<circle-spinner v-bind='$props' />"
})

CircleSpinnerTemplate.storyName = 'Circle Spinner'
CircleSpinnerTemplate.args = {
  dark: true,
  width: 50,
  height: 50
}
