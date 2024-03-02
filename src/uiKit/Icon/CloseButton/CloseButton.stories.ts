import { Meta, Story } from '@storybook/vue'

import {
  CloseButton,
  CloseButtonSize,
  CloseButtonProps
} from '.'

export default {
  title: 'Common/CloseButton',
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
} as Meta<typeof CloseButton>

const Template: Story<CloseButtonProps> = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { CloseButton },
  template: '<close-button v-bind="$props" />'
})

export const Small = Template.bind({})
Small.args = {
  size: CloseButtonSize.SMALL,
  disabled: false
}
Small.storyName = 'Small'

export const Large = Template.bind({})
Large.args = {
  size: CloseButtonSize.LARGE,
  disabled: false
}
Large.storyName = 'Large'
