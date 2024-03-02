import { Meta, Story } from '@storybook/vue'

import Shortcut from './Shortcut.vue'
import { ShortcutProps, ShortcutSize } from './types'

export default {
  title: 'Common/Shortcut',
  argTypes: {
    size: {
      control: { type: 'select' },
      options: Object.values(ShortcutSize),
      table: {
        type: { summary: 'ShortcutSize' }
      }
    }
  }
} as Meta<typeof Shortcut>

type Props = ShortcutProps & {
  label: string
}
const Template: Story<Props> = (args, { argTypes }) => ({
  components: { Shortcut },
  props: Object.keys(argTypes),
  template: '<shortcut v-bind="$props">{{ label }}</shortcut>'
})

export const Default: Story<Props> = Template.bind({})
Default.args = {
  alt: false,
  cmd: false,
  ctrl: false,
  inverted: false,
  label: '↵',
  shift: false,
  size: ShortcutSize.MEDIUM
}
