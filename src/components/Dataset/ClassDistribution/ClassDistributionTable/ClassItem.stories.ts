import { annotationClasses } from '@/storybook/fixtures'

import ClassItem from './ClassItem.vue'

const stories = {
  title: 'Dataset/ClassDistribution/ClassItem',
  argTypes: {
    annotationClass: { control: 'object' }
  }
}

export default stories

export const Normal = () => ({
  components: { ClassItem },
  props: ['annotationClass'],
  template: '<class-item v-bind="$props" />'
})

Normal.args = {
  annotationClass: annotationClasses.bottle
}

export const ClassWithLongName = () => ({
  components: { ClassItem },
  props: ['annotationClass'],
  template:
    `<div style="width: 100px">
      <class-item v-bind="$props" />
    </div>`
})

ClassWithLongName.args = {
  annotationClass: { ...annotationClasses.bottle, name: 'A much longer bottle' }
}
