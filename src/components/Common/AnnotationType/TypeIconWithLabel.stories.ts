import { annotationType } from '@/storybook/controls/annotationType'
import { color } from '@/storybook/controls/color'

import TypeIconWithLabel from './TypeIconWithLabel.vue'

const stories = {
  title: 'Common/AnnotationType/TypeIconWithLabel',
  argTypes: {
    color,
    label: { control: 'text' },
    tooltip: { control: 'text' },
    type: annotationType
  }
}

export default stories

export const Normal = () => ({
  components: { TypeIconWithLabel },
  props: ['color', 'label', 'type'],
  template: '<type-icon-with-label v-bind="$props" />'
})

Normal.args = {
  type: 'polygon',
  color: color.control.options[0],
  label: 'An item'
}
