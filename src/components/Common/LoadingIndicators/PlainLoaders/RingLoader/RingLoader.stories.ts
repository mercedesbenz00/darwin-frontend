import { Meta, Story } from '@storybook/vue'

import { IndicatorSize } from '@/components/Common/LoadingIndicators/PlainLoaders/types'

import RingLoader from './RingLoader.vue'
import { RingLoaderProps } from './types'

export default {
  title: 'LoadingIndicators/RingLoader',
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: Object.values(IndicatorSize).map((value) => value)
      },
      description: 'Defines the size for the component',
      table: {
        type: { summary: 'IndicatorSize' },
        defaultValue: { summary: 'IndicatorSize.MEDIUM' }
      }
    },
    backRingColor: {
      control: 'text',
      description: 'Defines the color of the back-ring of the loader',
      table: {
        type: { summary: 'String' },
        defaultValue: { summary: 'colorSurfaceDarken' }
      }
    },
    frontRingColor: {
      control: 'text',
      description: 'Defines the color of the front-ring of the loader',
      table: {
        type: { summary: 'String' },
        defaultValue: { summary: 'colorContentSecondary' }
      }
    }
  }
} as Meta<typeof RingLoader>

const Template: Story<RingLoaderProps> = (args, { argTypes }) => ({
  components: { RingLoader },
  props: Object.keys(argTypes),
  template: `
    <ring-loader v-bind='$props' />
  `
})

export const Default = Template.bind({})
Default.args = {
  size: IndicatorSize.MD
}

export const Custom = Template.bind({})
Custom.storyName = 'Custom colors'
Custom.args = {
  size: IndicatorSize.MD,
  backRingColor: 'red',
  frontRingColor: 'blue'
}
