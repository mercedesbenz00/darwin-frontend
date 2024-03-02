import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetPayload } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import ClassCardMenu from '@/components/Classes/ClassCardMenu.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

const mocks = { $can: () => true }
const stubs: Stubs = { VPopover }
let propsData: {
  isNonDataset?: boolean
  dataset?: DatasetPayload
}

beforeEach(() => {
  propsData = {}
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ClassCardMenu, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  const slots = { default: 'default-slot' }
  const wrapper = shallowMount(ClassCardMenu, { localVue, mocks, propsData, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when delete disabled', () => {
  const mocks = { $can: () => false }
  const wrapper = shallowMount(ClassCardMenu, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits edit when edit button is clicked', async () => {
  const wrapper = shallowMount(ClassCardMenu, { localVue, mocks, propsData, stubs })
  await wrapper.findAll('popup-menu-item-stub').at(0).trigger('click')
  expect(wrapper.emitted().edit).toBeDefined()
})

it('emits delete when delete button is clicked', async () => {
  const wrapper = shallowMount(ClassCardMenu, { localVue, mocks, propsData, stubs })
  await wrapper.findAll('popup-menu-item-stub').at(1).trigger('click')
  expect(wrapper.emitted().delete).toBeDefined()
})

describe('without dataset, isNonDataset is true', () => {
  beforeEach(() => {
    propsData.isNonDataset = true
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassCardMenu, { localVue, mocks, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('emits add-to-dataset', async () => {
    const wrapper = shallowMount(ClassCardMenu, { localVue, mocks, propsData, stubs })
    await wrapper.findAll('popup-menu-item-stub').at(0).trigger('click')
    expect(wrapper.emitted()['add-to-dataset']).toBeDefined()
  })
})

describe('with dataset, isNonDataset is false', () => {
  beforeEach(() => {
    propsData.dataset = buildDatasetPayload()
    propsData.isNonDataset = false
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassCardMenu, { localVue, mocks, propsData, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('emits remove-from-dataset', async () => {
    const wrapper = shallowMount(ClassCardMenu, { localVue, mocks, propsData, stubs })
    await wrapper.findAll('popup-menu-item-stub').at(0).trigger('click')
    expect(wrapper.emitted()['remove-from-dataset']).toBeDefined()
  })
})
