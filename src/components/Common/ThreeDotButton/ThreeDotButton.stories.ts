import { Meta, Story } from '@storybook/vue'

import {
  ThreeDotButton,
  DotButtonSize,
  ThreeDotButtonProps
} from '@/components/Common/ThreeDotButton'

export default {
  title: 'Common/ThreeDotButton',
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables any events, also changes appeareance',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' }
      }
    }
  }
} as Meta<typeof ThreeDotButton>

const Template: Story<ThreeDotButtonProps> = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { ThreeDotButton },
  template: '<three-dot-button v-bind="$props" />'
})

export const Small = Template.bind({})
Small.args = {
  size: DotButtonSize.SMALL,
  disabled: false
}
Small.storyName = 'Small'

export const Large = Template.bind({})
Large.args = {
  size: DotButtonSize.LARGE,
  disabled: false
}
Large.storyName = 'Large'
