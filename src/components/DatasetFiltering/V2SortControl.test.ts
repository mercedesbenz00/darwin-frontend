import { createLocalVue, shallowMount } from '@vue/test-utils'

import { emitRootStub } from 'test/unit/testHelpers'

import V2SortControl from '@/components/DatasetFiltering/V2SortControl.vue'

const localVue = createLocalVue()

let propsData: {
  sortBy: string
  sortDirection: 'asc' | 'desc'
}

beforeEach(() => {
  propsData = {
    sortBy: 'priority',
    sortDirection: 'asc'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(V2SortControl, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('sort with sort option', () => {
  it('emits sort option when change sort by', async () => {
    const wrapper = shallowMount(V2SortControl, { localVue, propsData })

    await emitRootStub(wrapper, 'change', 'byte_size')
    expect(wrapper.emitted()['update:sort-by']).toEqual([['byte_size']])
    expect(wrapper.emitted().change).toEqual([[{ sortBy: 'byte_size', sortDirection: 'asc' }]])
  })

  it('emits sort option when change sort direction', async () => {
    const wrapper = shallowMount(V2SortControl, { localVue, propsData })

    await emitRootStub(wrapper, 'change-direction', 'desc')
    expect(wrapper.emitted()['update:sort-direction']).toEqual([['desc']])
    expect(wrapper.emitted().change).toEqual([[{ sortBy: 'priority', sortDirection: 'desc' }]])
  })
})
