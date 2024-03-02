import { createLocalVue, shallowMount } from '@vue/test-utils'

import { emitRootStub } from 'test/unit/testHelpers'

import SortControl from '@/components/DatasetFiltering/SortControl.vue'

const localVue = createLocalVue()

let propsData: {
  sortBy: string
  sortDirection: 'asc' | 'desc'
}

beforeEach(() => {
  propsData = {
    sortBy: 'inserted_at',
    sortDirection: 'asc'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(SortControl, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('sort with sort option', () => {
  it('emits sort option when change sort by', async () => {
    const wrapper = shallowMount(SortControl, { localVue, propsData })

    await emitRootStub(wrapper, 'change', 'modified_at')
    expect(wrapper.emitted()['update:sort-by']).toEqual([['modified_at']])
    expect(wrapper.emitted().change).toEqual([[{ sortBy: 'modified_at', sortDirection: 'asc' }]])
  })

  it('emits sort option when change sort direction', async () => {
    const wrapper = shallowMount(SortControl, { localVue, propsData })

    await emitRootStub(wrapper, 'change-direction', 'desc')
    expect(wrapper.emitted()['update:sort-direction']).toEqual([['desc']])
    expect(wrapper.emitted().change).toEqual([[{ sortBy: 'inserted_at', sortDirection: 'desc' }]])
  })
})
