import { action } from '@storybook/addon-actions'
import { Meta, Story } from '@storybook/vue'

import { Badge, BadgeProps } from '.'

export default {
  title: 'Common/Badge',
  argTypes: {
    label: {
      control: 'string',
      description: 'The label shown within the badge',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'African grey' }
      }
    },
    overrideTooltip: {
      control: 'string',
      description: 'Override the tooltip, which usually shows the label',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'custom tooltip' }
      }
    },
    color: {
      control: 'object',
      description: 'The label color',
      table: {
        type: { summary: 'RGBA' },
        defaultValue: { summary: '{ r: 64, g: 181, b: 181, a: 1 }' }
      }
    },
    highContrast: {
      control: 'boolean',
      description: 'Maximize the background color alpha and use wite as text color - true | false',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' }
      }
    },
    size: {
      control: 'string',
      description: 'Decide the component size - small | medium | large',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'small' }
      }
    },
    tag: {
      control: 'string',
      description: 'Decide the component tag - div | | router-link | a | button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'div' }
      }
    }
  }
} as Meta<typeof Badge>

// BADGE WITH SHORT LABEL
export const ShortLabel: Story<BadgeProps> = (args, { argTypes }) => ({
  components: { Badge },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<badge v-bind="$props" style="float: left" />'
})
ShortLabel.args = {
  label: 'foo'
}

// BLUE BADGE
export const BlueBadge: Story<BadgeProps> = (args, { argTypes }) => ({
  components: { Badge },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<badge v-bind="$props" style="float: left" />'
})
BlueBadge.args = {
  label: 'foo',
  color: { r: 0, g: 0, b: 255, a: 1 }
}

// RED BADGE
export const RedBadge: Story<BadgeProps> = (args, { argTypes }) => ({
  components: { Badge },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<badge v-bind="$props" style="float: left" />'
})
RedBadge.args = {
  label: 'foo',
  color: { r: 255, g: 0, b: 0, a: 1 }
}

// GREEN BADGE
export const GreenBadge: Story<BadgeProps> = (args, { argTypes }) => ({
  components: { Badge },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<badge v-bind="$props" style="float: left" />'
})
GreenBadge.args = {
  label: 'foo',
  color: { r: 0, g: 255, b: 0, a: 1 }
}

// BADGE WITH LONG LABEL
export const LongLabel: Story<BadgeProps> = (args, { argTypes }) => ({
  components: { Badge },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<badge v-bind="$props" style="float: left" />'
})
LongLabel.args = {
  label: 'African Grey parrot'
}

// BADGE OVERRIDE TOOLTIP
export const OverridenTooltip: Story<BadgeProps> = (args, { argTypes }) => ({
  components: { Badge },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<badge v-bind="$props" style="float: left" />'
})
OverridenTooltip.args = {
  label: 'foo',
  tooltip: 'foo bar baz'
}

// BADGE HIGH CONTRAST
export const HighContrast: Story<BadgeProps> = (args, { argTypes }) => ({
  components: { Badge },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<badge v-bind="$props" style="float: left" />'
})
HighContrast.args = {
  label: 'foo',
  highContrast: true
}

// BADGE SMALL
export const Small: Story<BadgeProps> = (args, { argTypes }) => ({
  components: { Badge },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<badge v-bind="$props" style="float: left" />'
})
Small.args = {
  label: 'foo',
  size: 'small'
}

// BADGE DELETABLE
export const Deletable: Story<BadgeProps> = (args, { argTypes }) => ({
  components: { Badge },
  props: Object.keys(argTypes),
  methods: { onClick: action('onClick') },
  template: '<badge v-bind="$props" style="float: left" />'
})
Deletable.args = {
  label: 'foo',
  deletable: true
}
