import { createLocalVue, shallowMount } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'

import FilterItem from '@/components/Common/Filter/FilterItem.vue'
import StatusFilterItem from '@/components/DatasetFiltering/StatusFilter/V1/StatusFilterItem.vue'
import { StatusFilterItemType } from '@/components/DatasetFiltering/types'
import { TriToggleStatus } from '@/utils'

const localVue = createLocalVue()

const mocks = {
  $theme: createMockTheme()
}

/**
 * We unstub the FilterItem component because it's complex and supports up to
 * 3 different slots, which a stubbed component wouldn't render. This way, our
 * snapshots are safer
 */
const stubs = { FilterItem }

let propsData: {
  data: StatusFilterItemType
  status?: TriToggleStatus
}

beforeEach(() => {
  propsData = {
    data: {
      id: 'new',
      label: 'New',
      icon: 'new.svg',
      count: 5,
      omitFromAllSelected: false
    }
  }
})

it('matches snapshot when selected positive', () => {
  propsData.status = 'positive'
  const wrapper = shallowMount(StatusFilterItem, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected negative', () => {
  propsData.status = 'negative'
  const wrapper = shallowMount(StatusFilterItem, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when not selected', () => {
  propsData.status = 'none'
  const wrapper = shallowMount(StatusFilterItem, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emit click if you click on wrapper', async () => {
  propsData.status = 'none'
  const wrapper = shallowMount(StatusFilterItem, { localVue, mocks, propsData, stubs })
  await wrapper.find('.status-filter-item').trigger('click')
  expect(wrapper.emitted().click).toBeDefined()
})
