import { Meta, Story } from '@storybook/vue'

import Slider from './Slider.vue'
import { SliderProps, SliderVariant } from './types'

export default {
  title: 'Common/Slider/V2',
  argTypes: {
    value: {
      control: 'number'
    },
    min: {
      control: 'number'
    },
    max: {
      control: 'number'
    },
    step: {
      control: 'number'
    },
    variant: {
      control: {
        type: 'select'
      },
      options: Object.entries(SliderVariant).map((val) => val[1]),
      description: 'Apply different variants to slider.',
      table: {
        type: { summary: 'SliderVariant' },
        defaultValue: { summary: 'SliderVariant.DEFAULT' }
      }
    }
  }
} as Meta<typeof Slider>

const Template: Story<SliderProps> = (args, { argTypes }) => ({
  components: { Slider },
  props: Object.keys(argTypes),
  template: `
    <slider v-bind="$props" />
  `
})

export const Default = Template.bind({})
Default.args = {
  value: 0,
  min: 0,
  max: 100,
  step: 1,
  variant: SliderVariant.DEFAULT
}

export const Steps = Template.bind({})
Steps.args = {
  value: 0,
  min: 0,
  max: 100,
  step: 10,
  variant: SliderVariant.STEPS
}
