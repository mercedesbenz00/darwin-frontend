import { annotationClasses } from '@/storybook/fixtures'

import HideByClassItem from './HideByClassItem.vue'

const stories = {
  title: 'Workview/LayerBar/AnnotationControl/ClassItem',
  argTypes: {
    annotationClass: { control: 'object' },
    count: { control: 'number' }
  }
}

export default stories

export const Normal = () => ({
  components: { HideByClassItem },
  props: ['annotationClass', 'count', 'selected'],
  template: '<hide-by-class-item v-bind="$props" />'
})

Normal.args = {
  annotationClass: annotationClasses.bottle,
  count: 5,
  selected: false
}

export const ClassWithLongName = () => ({
  components: { HideByClassItem },
  props: ['annotationClass', 'count'],
  template:
    `<div style="width: 100px">
      <hide-by-class-item v-bind="$props" />
    </div>`
})

ClassWithLongName.args = {
  annotationClass: { ...annotationClasses.bottle, name: 'A much longer bottle' },
  count: 5
}

export const Selected = () => ({
  components: { HideByClassItem },
  props: ['annotationClass', 'count', 'selected'],
  template: '<hide-by-class-item v-bind="$props" />'
})

Selected.args = {
  annotationClass: annotationClasses.bottle,
  count: 5,
  selected: true
}
