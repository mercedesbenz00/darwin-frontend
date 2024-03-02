import { Meta, Story } from '@storybook/vue'

import store from '@/store'
import { annotationClasses, annotationTypes } from '@/storybook/fixtures'

import {
  ClassFilter,
  ClassFilterItemType,
  ClassFilterProps
} from './'

const Sidebar = () => {
  return {
    template: '<div style="width: 200px;"><story/></div>'
  }
}

export default {
  title: 'DatasetFiltering/ClassFilterV2',
  decorators: [Sidebar]
} as Meta<typeof ClassFilter>

const setupStore = () => {
  store.commit('aclass/SET_TYPES', [...Object.values(annotationTypes)])
  store.commit('aclass/SET_CLASSES', [...Object.values(annotationClasses)])
}

const tag1: ClassFilterItemType = {
  id: 1,
  aclass: annotationClasses.flask,
  label: 'A label',
  icon: 'An icon',
  count: 10
}

const tag2: ClassFilterItemType = {
  id: 2,
  aclass: annotationClasses.scale,
  label: 'A label 2',
  icon: 'An icon 2',
  count: 3
}

const tag3: ClassFilterItemType = {
  id: 3,
  aclass: annotationClasses.blurry,
  label: 'A label 3',
  icon: 'An icon 3',
  count: 0
}

const base: Story<ClassFilterProps> = (args, { argTypes }) => ({
  components: { ClassFilter },
  props: Object.keys(argTypes),
  store,
  template: '<div style="width:260px"><class-filter v-bind="$props" /></div>',
  beforeMount () {
    setupStore()
  }
})

const baseArgs = {
  options: [tag1, tag2, tag3],
  positiveOptions: [],
  negativeOptions: [],
  imagesSelecting: true
}

export const Normal = base.bind({})
Normal.args = { ...baseArgs }
