import { Meta, Story } from '@storybook/vue'

import Keycap from './Keycap.vue'
import { KeycapProps, KeycapSize } from './types'

export default {
  title: 'Common/Keycap',
  argTypes: {
    size: {
      control: { type: 'select' },
      options: Object.values(KeycapSize),
      table: {
        type: { summary: 'KeycapSize' },
        defaultValue: { summary: 'KeycapSize.MEDIUM' }
      }
    }
  }
} as Meta<typeof Keycap>

type Props = KeycapProps & {
  label: string
}
const Template: Story<Props> = (args, { argTypes }) => ({
  components: { Keycap },
  props: Object.keys(argTypes),
  template: '<keycap v-bind="$props">{{ label }}</keycap>'
})

export const Default: Story<Props> = Template.bind({})
Default.args = {
  inverted: false,
  label: '',
  size: KeycapSize.MEDIUM
}

export const Enter: Story<Props> = Template.bind({})
Enter.args = {
  ...Default.args,
  label: '↵'
}
