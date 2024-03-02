import { createLocalVue, shallowMount } from '@vue/test-utils'

import ListItemHeaderItem from '@/components/DatasetManagement/ListItem/ListItemHeader/ListItemHeaderItem.vue'

const localVue = createLocalVue()

let propsData: {
  id: string,
  title?: string,
  sortDirection?: 'asc' | 'desc',
  active?: boolean,
  sortable?: boolean
}

it('matches snapshot with default props', () => {
  propsData = {
    id: 'column 1'
  }
  const wrapper = shallowMount(ListItemHeaderItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with title', () => {
  propsData = {
    id: 'column 1',
    title: 'Column 1'
  }
  const wrapper = shallowMount(ListItemHeaderItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with title desc', () => {
  propsData = {
    id: 'column 1',
    sortDirection: 'desc'
  }
  const wrapper = shallowMount(ListItemHeaderItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when active', () => {
  propsData = {
    id: 'column 1',
    active: true
  }
  const wrapper = shallowMount(ListItemHeaderItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when sortable', () => {
  propsData = {
    id: 'column 1',
    sortable: true
  }
  const wrapper = shallowMount(ListItemHeaderItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
