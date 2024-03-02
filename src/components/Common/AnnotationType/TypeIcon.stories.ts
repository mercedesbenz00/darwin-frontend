import { annotationType } from '@/storybook/controls/annotationType'
import { color } from '@/storybook/controls/color'

import TypeIcon from './TypeIcon.vue'

const stories = {
  title: 'Common/AnnotationType/TypeIcon',
  argTypes: {
    color,
    type: annotationType
  }
}

export default stories

export const Normal = () => ({
  components: { TypeIcon },
  props: ['color', 'type'],
  template: '<type-icon v-bind="$props" />'
})

Normal.args = {
  type: 'polygon',
  color: color.control.options[0]
}
