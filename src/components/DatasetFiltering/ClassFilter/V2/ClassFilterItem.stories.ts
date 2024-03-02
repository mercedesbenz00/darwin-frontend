import { Meta, Story } from '@storybook/vue'

import store from '@/store'
import { annotationClasses, annotationTypes } from '@/storybook/fixtures'

import ClassFilterItem from './ClassFilterItem.vue'
import { ClassFilterItemProps, ClassFilterItemType } from './types'

const Sidebar = () => {
  return {
    template: '<div style="width: 200px;"><story/></div>'
  }
}

export default {
  title: 'DatasetFiltering/ClassFilterItemV2',
  decorators: [Sidebar],
  argTypes: {
    data: {
      control: 'object',
      description: 'Filter item data'
    },
    status: { control: { type: 'radio', options: ['positive', 'negative', 'none'] } },
    actionDisabled: {
      control: 'boolean',
      description: 'Disables or enables action buttons',
      table: {
        type: { summary: 'Boolean' },
        defaultValue: { summary: 'false' }
      }
    },
    actionHide: {
      control: 'boolean',
      description: 'Shows or hides action buttons',
      table: {
        type: { summary: 'Boolean' },
        defaultValue: { summary: 'false' }
      }
    }
  }
} as Meta<typeof ClassFilterItem>

const setupStore = () => {
  store.commit('aclass/SET_TYPES', [...Object.values(annotationTypes)])
  store.commit('aclass/SET_CLASSES', [...Object.values(annotationClasses)])
}

const data: ClassFilterItemType = {
  id: 1,
  aclass: annotationClasses.flask,
  label: 'A label',
  icon: 'An icon',
  count: 10
}

const base: Story<ClassFilterItemProps> = (args, { argTypes }) => ({
  components: { ClassFilterItem },
  props: Object.keys(argTypes),
  store,
  template: '<class-filter-item v-bind="$props" />',
  beforeMount () {
    setupStore()
  }
})

const baseArgs = {
  data,
  status: 'none',
  actionDisabled: false,
  actionHide: false
}

export const Normal = base.bind({})
Normal.args = { ...baseArgs }

export const Positive = base.bind({})
Positive.args = { ...baseArgs, status: 'positive' }

export const Negative = base.bind({})
Negative.args = { ...baseArgs, status: 'negative' }
