import { createLocalVue, shallowMount } from '@vue/test-utils'

import StatusFilter from '@/components/DatasetFiltering/StatusFilter/V1/StatusFilter.vue'
import { StatusFilterItemType } from '@/components/DatasetFiltering/types'

const localVue = createLocalVue()

const options: StatusFilterItemType[] = [{
  id: 'new',
  label: 'New',
  icon: 'new.svg',
  count: 5,
  omitFromAllSelected: false
}, {
  id: 'completed',
  label: 'Completed',
  icon: 'completed.svg',
  count: 1,
  omitFromAllSelected: false
}, {
  id: 'commented',
  label: 'Commented',
  icon: 'commented.svg',
  count: 4,
  omitFromAllSelected: true
}]

let propsData: {
  options: StatusFilterItemType[]
  positiveOptions: string[]
  negativeOptions: string[]
  commented?: boolean
  optionsToHide?: string[]
  showAll?: boolean
  allCount?: number
}

beforeEach(() => {
  propsData = {
    options,
    positiveOptions: [],
    negativeOptions: [],
    commented: false,
    showAll: true,
    allCount: 6
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(StatusFilter, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when there are hidden options', async () => {
  propsData.optionsToHide = ['completed']
  const wrapper = shallowMount(StatusFilter, { localVue, propsData })
  expect(wrapper).toMatchSnapshot('hidden')
  await wrapper.find('.status-filter-hide-button').trigger('click')
  expect(wrapper).toMatchSnapshot('revealed')
})

it('reveals and hides options', async () => {
  propsData.optionsToHide = ['completed']
  const wrapper = shallowMount(StatusFilter, { localVue, propsData })

  expect(wrapper.findAll('status-filter-item-stub').length).toBe(3)

  await wrapper.find('.status-filter-hide-button').trigger('click')
  expect(wrapper.findAll('status-filter-item-stub').length).toBe(4)

  await wrapper.find('.status-filter-hide-button').trigger('click')
  expect(wrapper.findAll('status-filter-item-stub').length).toBe(3)
})

it('emits change/input when option is clicked', async () => {
  const wrapper = shallowMount(StatusFilter, { localVue, propsData })
  await wrapper.findAll('status-filter-item-stub').at(1).vm.$emit('click', options[0])
  expect(wrapper.emitted().change).toEqual([[{
    positiveOptions: ['new'],
    negativeOptions: []
  }]])
})

it('emits change/input when all option is clicked', async () => {
  const wrapper = shallowMount(StatusFilter, { localVue, propsData })
  await wrapper.findAll('status-filter-item-stub').at(0).vm.$emit('click')
  expect(wrapper.emitted().change).toEqual([[{
    positiveOptions: ['new', 'completed'],
    negativeOptions: []
  }]])
})
