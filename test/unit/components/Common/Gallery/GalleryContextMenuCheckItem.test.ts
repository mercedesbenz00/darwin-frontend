import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { emitRootStub } from 'test/unit/testHelpers'

import GalleryContextMenuCheckItem from '@/components/Common/Gallery/GalleryContextMenuCheckItem.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

let propsData: {
  label: string
  value: boolean
  tooltip?: string
  disabled?: boolean
}

beforeEach(() => {
  propsData = {
    label: 'Context Menu Item',
    value: false
  }
})
it('matches snapshot without icon', () => {
  const wrapper = shallowMount(GalleryContextMenuCheckItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected', () => {
  propsData.value = true
  const wrapper = shallowMount(GalleryContextMenuCheckItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when disabled', () => {
  propsData.disabled = true
  const wrapper = shallowMount(GalleryContextMenuCheckItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('renders tooltip properly', () => {
  propsData.tooltip = 'Tooltip'
  const wrapper = shallowMount(GalleryContextMenuCheckItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits click event when clicked', async () => {
  const wrapper = shallowMount(GalleryContextMenuCheckItem, { localVue, propsData })
  const mouseEventMock = {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn()
  }
  await emitRootStub(wrapper, 'click', mouseEventMock)
  expect(wrapper.emitted().click).toBeDefined()
})
