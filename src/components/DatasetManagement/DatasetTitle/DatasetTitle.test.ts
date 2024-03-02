import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildDatasetPayload } from 'test/unit/factories'

import DatasetTitle from './DatasetTitle.vue'

const localVue = createLocalVue()
const stubs = ['check-box']

const privateDataset = buildDatasetPayload({ id: 5, name: 'SFH', public: false })
const publicDataset = buildDatasetPayload({ id: 5, name: 'SFH', public: true })

it('matches snapshot when public', () => {
  const propsData = { dataset: publicDataset }
  const wrapper = shallowMount(DatasetTitle, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when private', () => {
  const propsData = { dataset: privateDataset }
  const wrapper = shallowMount(DatasetTitle, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when editable', () => {
  const propsData = { dataset: privateDataset, editable: true }
  const wrapper = shallowMount(DatasetTitle, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits title change', async () => {
  const propsData = { dataset: privateDataset, editable: true }
  const wrapper = shallowMount(DatasetTitle, { localVue, propsData, stubs })
  await wrapper.find('content-editable-stub').vm.$emit('input', 'New SFH')
  await wrapper.find('content-editable-stub').vm.$emit('change')
  expect(wrapper.emitted().input).toEqual([['New SFH']])
  expect(wrapper.emitted().change).toEqual([['New SFH']])
})
