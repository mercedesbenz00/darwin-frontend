import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { Dropdown } from 'test/unit/stubs'
import { emitRootStub } from 'test/unit/testHelpers'

import ExportFormatDropdown from '@/components/DatasetManagement/ExportDialog/V1/ExportFormatDropdown.vue'

const stubs: Stubs = { Dropdown }
const localVue = createLocalVue()

let propsData: { value: string | null }

beforeEach(() => {
  propsData = { value: 'json' }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ExportFormatDropdown, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits input, change event when dropdown selected option is changed', () => {
  const wrapper = shallowMount(ExportFormatDropdown, { localVue, propsData, stubs })
  emitRootStub(wrapper, 'input', { id: 'coco' })
  expect(wrapper.emitted().input).toEqual([['coco']])
})
