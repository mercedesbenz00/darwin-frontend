import { annotationClasses } from '@/storybook/fixtures'

import ClassFilterItem from './ClassFilterItem.vue'
import { ClassFilterItemType } from './types'

const Sidebar = () => {
  return {
    template: '<div style="width: 200px;"><story/></div>'
  }
}

const stories = {
  title: 'DatasetFiltering/ClassFilterItem',
  decorators: [Sidebar],
  argTypes: {
    data: { control: 'object' },
    status: { control: { type: 'radio', options: ['positive', 'negative', 'none'] } },
    actionDisabled: { control: 'boolean' },
    actionHide: { control: 'boolean' }
  }
}

export default stories

const data: ClassFilterItemType = {
  id: 1,
  aclass: annotationClasses.flask,
  label: 'A label',
  icon: 'An icon',
  count: 10
}

const base = {
  components: { ClassFilterItem },
  props: ['data', 'status', 'actionHide', 'actionDisabled'],
  template: '<class-filter-item v-bind="$props" />'
}

const baseArgs = {
  data,
  status: 'none',
  actionDisabled: false,
  actionHide: false
}

export const Normal = () => ({ ...base })
Normal.args = { ...baseArgs }

export const Positive = () => ({ ...base })
Positive.args = { ...baseArgs, status: 'positive' }

export const Negative = () => ({ ...base })
Negative.args = { ...baseArgs, status: 'negative' }

export const Hidden = () => ({ ...base })
Hidden.args = { ...baseArgs, actionHide: true }

export const Disabled = () => ({ ...base })
Disabled.args = { ...baseArgs, actionDisabled: true }
