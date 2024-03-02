import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotationClassImagePayload,
  buildAnnotationClassPayload,
  buildDatasetPayload
} from 'test/unit/factories'
import { Transition } from 'test/unit/stubs'

import ClassCard from '@/components/Classes/ClassCard.vue'
import { AnnotationClassPayload, DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('lazy', stubDirectiveWithAttribute)
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.use(Vuex)

// store is read-only for this component, so can be shared
const store = createTestStore()
setDefaultAnnotationTypes(store)

const mocks = { $can: () => true }
const stubs: Stubs = { Transition }
let propsData: {
  annotationClass: AnnotationClassPayload
  selected?: boolean
  dataset?: DatasetPayload | null
}

beforeEach(() => {
  propsData = {
    annotationClass: buildAnnotationClassPayload({
      id: 1,
      name: 'class',
      images: [
        buildAnnotationClassImagePayload({ id: 'a-uuid', crop_url: 'a' }),
        buildAnnotationClassImagePayload({ id: 'b-uuid', crop_url: 'b' }),
        buildAnnotationClassImagePayload({ id: 'c-uuid', crop_url: 'c' }),
        buildAnnotationClassImagePayload({ id: 'd-uuid', crop_url: 'd' }),
        buildAnnotationClassImagePayload({ id: 'e-uuid', crop_url: 'e' })
      ],
      metadata: { _color: '#000000' },
      annotation_types: ['bounding_box']
    })
  }
})

describe('without dataset', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot when selected', () => {
    propsData.selected = true
    const wrapper = shallowMount(ClassCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('with dataset', () => {
  const dataset = buildDatasetPayload({ id: 1 })

  beforeEach(() => {
    propsData.dataset = dataset
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot when annotationClass is added to the dataset', () => {
    propsData.annotationClass.datasets = [{ id: dataset.id }]
    const wrapper = shallowMount(ClassCard, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

it('emits add-to-dataset when you click on add-to-dataset', async () => {
  const wrapper = shallowMount(ClassCard, { localVue, mocks, propsData, store, stubs })
  await wrapper.find('class-card-overlay-stub').vm.$emit('add-to-dataset')
  expect(wrapper.emitted()['add-to-dataset']).toBeDefined()
})

it('emits remove-from-dataset when you click on remove-from-dataset', async () => {
  const wrapper = shallowMount(ClassCard, { localVue, mocks, propsData, store, stubs })
  await wrapper.find('class-card-overlay-stub').vm.$emit('remove-from-dataset')
  expect(wrapper.emitted()['remove-from-dataset']).toBeDefined()
})

it('emits edit when you click on edit', async () => {
  const wrapper = shallowMount(ClassCard, { localVue, mocks, propsData, store, stubs })
  await wrapper.find('class-card-overlay-stub').vm.$emit('edit')
  expect(wrapper.emitted().edit).toBeDefined()
})

it('emits delete when you click on delete', async () => {
  const wrapper = shallowMount(ClassCard, { localVue, mocks, propsData, store, stubs })
  await wrapper.find('class-card-overlay-stub').vm.$emit('delete')
  expect(wrapper.emitted().delete).toBeDefined()
})

it('emits "select" when clicked', async () => {
  const wrapper = shallowMount(ClassCard, { localVue, mocks, propsData, store, stubs })
  await wrapper.find('.class-card').trigger('click')
  expect(wrapper.emitted().select).toEqual([[{
    ...propsData.annotationClass,
    selected: true
  }]])
})

it('emits "select" when checkbox is selected', async () => {
  const wrapper = shallowMount(ClassCard, { localVue, mocks, propsData, store, stubs })
  await wrapper.find('class-card-overlay-stub').vm.$emit('update:selected', true)
  expect(wrapper.emitted().select).toEqual([[{
    ...propsData.annotationClass,
    selected: true
  }]])
})
