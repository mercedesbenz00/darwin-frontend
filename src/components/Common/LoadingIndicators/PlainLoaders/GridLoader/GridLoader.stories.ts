import { Meta, Story } from '@storybook/vue'

import { GridLoader } from '@/components/Common/LoadingIndicators'
import {
  DefaultIndicatorProps,
  IndicatorSize
} from '@/components/Common/LoadingIndicators/PlainLoaders/types'

export default {
  title: 'LoadingIndicators/GridLoader',
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
    }
  }
} as Meta<typeof GridLoader>

export const GridLoaderTemplate: Story<DefaultIndicatorProps> = (args, { argTypes }) => ({
  components: { GridLoader },
  props: Object.keys(argTypes),
  template: "<grid-loader v-bind='$props' />"
})

GridLoaderTemplate.storyName = 'GridLoader'
GridLoaderTemplate.args = {
  size: IndicatorSize.XS
}
