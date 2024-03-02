import { annotationType } from '@/storybook/controls/annotationType'
import { color } from '@/storybook/controls/color'

import TypeToggleWithLabel from './TypeToggleWithLabel.vue'

const stories = {
  title: 'Common/AnnotationType/TypeToggleWithLabel',
  argTypes: {
    color,
    label: { control: 'text' },
    tooltip: { control: 'text' },
    type: annotationType,
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onClick: { action: 'click' }
  }
}

type Args = Record<keyof typeof stories.argTypes, any>

export default stories

export const Normal = (args: Args) => ({
  components: { TypeToggleWithLabel },
  props: ['color', 'label', 'type', 'tooltip', 'selected', 'disabled'],
  template: '<type-toggle-with-label v-bind="$props" @click="onClick" />',
  methods: { onClick: args.onClick }
})

Normal.args = {
  type: 'polygon',
  color: color.control.options[0],
  label: 'An item',
  selected: false
}

export const Selected = (args: Args) => ({
  components: { TypeToggleWithLabel },
  props: ['color', 'label', 'type', 'tooltip', 'selected', 'disabled'],
  template: '<type-toggle-with-label v-bind="$props" @click="onClick" />',
  methods: { onClick: args.onClick }
})

Selected.args = {
  type: 'polygon',
  color: color.control.options[0],
  label: 'An item',
  selected: true
}
