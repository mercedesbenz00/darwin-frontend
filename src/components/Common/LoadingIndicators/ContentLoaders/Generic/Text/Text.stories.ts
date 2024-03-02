import { Meta, Story } from '@storybook/vue'

import { TextSize } from '@/components/Common/LoadingIndicators/ContentLoaders/Generic/Text/types'

import TextContentLoader from './Text.vue'

export default {
  title: 'ContentLoader/Generic/Text',
  argTypes: {
    variant: {
      control: {
        type: 'select'
      },
      options: Object.entries(TextSize).map((val) => val[1]),
      description: 'Select the text size variant. Equivalent to scss typography breakpoints',
      table: {
        type: { summary: 'TextSize' },
        defaultValue: { summary: 'TextSize.MD1' }
      }
    }
  }
} as Meta<typeof Text>

export const Default: Story = (args, { argTypes }) => ({
  components: { TextContentLoader },
  props: Object.keys(argTypes),
  template: `
    <text-content-loader v-bind="$props" />
  `
})

Default.storyName = 'Text'
Default.args = {
  variant: TextSize.MD1,
  width: 120
}
