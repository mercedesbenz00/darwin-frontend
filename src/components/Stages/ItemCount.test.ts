import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import { useItemCountsStore } from '@/composables/useItemCountsStore'

import ItemCount from './ItemCount.vue'

const localVue = createLocalVue()
localVue.use(PiniaVuePlugin)
localVue.directive('tooltip', stubDirectiveWithAttribute)

const pinia = createTestingPinia()
const counts = useItemCountsStore()

const propsData = {
  stageId: 'stage-with-no-data'
}

beforeEach(() => {
  counts.stageCounts = {
    status: 'fetched',
    error: null,
    data: {
      simple_counts: [
        { dataset_id: 1, stage_id: 'stage-with-321', item_count: 321 },
        { dataset_id: 1, stage_id: 'stage-with-1249', item_count: 1249 },
        { dataset_id: 1, stage_id: 'stage-with-1250', item_count: 1250 },
        { dataset_id: 1, stage_id: 'stage-with-11250', item_count: 11250 }
      ]
    }
  }
})

it('matches snapshot', () => {
  propsData.stageId = 'stage-with-no-data'
  const wrapper = shallowMount(ItemCount, { localVue, pinia, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('renders counts correctly based on value', async () => {
  const wrapper = shallowMount(ItemCount, { localVue, pinia, propsData })
  await wrapper.setProps({ stageId: 'stage-with-no-data' })
  expect(wrapper.text()).toEqual('0')

  await wrapper.setProps({ stageId: 'stage-with-321' })
  expect(wrapper.text()).toEqual('321')

  await wrapper.setProps({ stageId: 'stage-with-1249' })
  expect(wrapper.text()).toEqual('1.2k')

  await wrapper.setProps({ stageId: 'stage-with-1250' })
  expect(wrapper.text()).toEqual('1.3k')

  await wrapper.setProps({ stageId: 'stage-with-11250' })
  expect(wrapper.text()).toEqual('11k')
})

it ('renders loading indicator when counts are unfetched', () => {
  counts.stageCounts.status = 'fetching'
  const wrapper = shallowMount(ItemCount, { localVue, pinia, propsData })
  expect(wrapper.find('ringloader-stub').exists()).toBe(true)
})

it('renders loading indicator when counts are reset', async () => {
  const wrapper = shallowMount(ItemCount, { localVue, pinia, propsData })
  await wrapper.setProps({ stageId: 'stage-with-no-data' })
  expect(wrapper.text()).toEqual('0')
  expect(wrapper.find('ringloader-stub').exists()).toBe(false)

  counts.stageCounts.status = 'fetching'
  counts.stageCounts.data = null
  counts.stageCounts.error = null

  await wrapper.vm.$nextTick()

  expect(wrapper.text()).toEqual('')
  expect(wrapper.find('ringloader-stub').exists()).toBe(true)
})
