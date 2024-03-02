import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import { Badges, BadgeProps } from '.'

// DEFAULT
const items: BadgeProps[] = [
  {
    label: 'foo',
    color: { r: 64, g: 181, b: 181, a: 1 },
    highContrast: false
  },
  {
    label: 'bar',
    color: { r: 181, g: 64, b: 181, a: 1 },
    highContrast: false
  },
  {
    label: 'baz',
    color: { r: 181, g: 181, b: 64, a: 1 },
    highContrast: false
  }
]

export default {
  title: 'Common/Badges',
  argTypes: {
    items: {
      control: 'object',
      description: 'A list of badges',
      table: {
        type: { summary: 'object' },
        defaultValue: { summary: '[]' }
      }
    },
    highContrast: {
        control: 'boolean',
        description:
          'Maximize the background color alpha and use wite as text color - true | false',
        table: {
          type: { summary: 'boolean' },
          defaultValue: { summary: 'true' }
        }
      },
    wrap: {
      control: 'boolean',
      description: 'Decide if badegs will wrap to a new line or be trimmed - true | false',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    }
  }
} as Meta<typeof Badges>

// WRAP BADGES
export const WrapBadges: Story = (args, { argTypes }) => ({
  components: { Badges },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <div style="width: 60px; background-color: rgba(0, 0, 0, .05); overflow: hidden;">
      <badges v-bind="$props" />
    </div>
  `
})
WrapBadges.args = {
  items,
  wrap: true
}

// TRIM BADGES
export const TrimBadges: Story = (args, { argTypes }) => ({
  components: { Badges },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: `
    <div style="width: 60px; background-color: rgba(0, 0, 0, .05); overflow: hidden;">
      <badges v-bind="$props" />
    </div>
  `
})
TrimBadges.args = {
  items,
  wrap: false
}
