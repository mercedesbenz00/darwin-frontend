import { Meta, Story } from '@storybook/vue'

import { ProgressBarVariant } from '@/components/Common/ProgressBar/types'

import ProgressBar from './ProgressBar.vue'

export default {
  title: 'Common/ProgressBar',
  argTypes: {
    variant: {
      control: {
        type: 'select'
      },
      options: Object.entries(ProgressBarVariant).map((val) => val[1]),
      description: 'Select the progress bar variant. Choose between active and inactive',
      table: {
        type: { summary: 'ProgressBarVariant' },
        defaultValue: { summary: 'ProgressBarVariant.ACTIVE' }
      }
    },
    value: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01
      },
      description: 'Value of progress bar. Decimal 0 to props.max',
      table: {
        type: { summary: 'ProgressBarVariant' },
        defaultValue: { summary: 'ProgressBarVariant.ACTIVE' }
      }
    }
  }
} as Meta<typeof ProgressBar>

export const Default: Story = (args, { argTypes }) => ({
  components: { ProgressBar },
  props: Object.keys(argTypes),
  template: "<progress-bar v-bind='$props' />"
})
Default.args = {
  value: 0.25,
  variant: ProgressBarVariant.ACTIVE
}
