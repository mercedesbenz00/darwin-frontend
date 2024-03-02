import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildAnnotationTypePayload,
  buildDatasetItemPayload,
  buildDatasetItemsCountPayload,
  buildDatasetPayload
} from 'test/unit/factories'
import { nthEmitted } from 'test/unit/testHelpers'

import ClassFilter from '@/components/WorkView/WorkflowFilter/ClassFilter.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const mocks = {}
let propsData: {
  positiveClassIds: number[],
  negativeClassIds: number[],
  imagesSelecting?: boolean
}
let store: ReturnType<typeof createTestStore>

const datasetItemsCount = buildDatasetItemsCountPayload({
  class_counts: [
    { id: 1, name: 'foo', count: 10 },
    { id: 2, name: 'foo', count: 15 },
    { id: 3, name: 'foo', count: 99 },
    { id: 4, name: 'foo', count: 72 }
  ]
})
const tagTypePayload = buildAnnotationTypePayload({ id: 1, name: 'tag' })
const boundingBoxTypePayload = buildAnnotationTypePayload({ id: 2, name: 'bounding_box' })

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_DATASET', buildDatasetPayload({ id: 9 }))
  store.commit('aclass/SET_CLASSES', [
    buildAnnotationClassPayload({
      id: 1,
      annotation_types: ['tag'],
      datasets: [{ id: 9 }]
    }),
    buildAnnotationClassPayload({
      id: 2,
      annotation_types: ['bounding_box'],
      datasets: [{ id: 9 }]
    }),

    // control classes. in store, but do not belong to current dataset
    buildAnnotationClassPayload({
      id: 3,
      annotation_types: ['tag'],
      datasets: [{ id: 10 }]
    }),
    buildAnnotationClassPayload({
      id: 4,
      annotation_types: ['bounding_box'],
      datasets: [{ id: 11 }]
    })
  ])
  store.commit('aclass/SET_TYPES', [tagTypePayload, boundingBoxTypePayload])
  store.commit('workview/SET_DATASET_ITEM_COUNTS', datasetItemsCount)
  store.commit('workview/PUSH_DATASET_ITEMS', [
    buildDatasetItemPayload({ id: 1 })
  ])
  jest.spyOn(store, 'dispatch').mockResolvedValue({})

  propsData = {
    positiveClassIds: [],
    negativeClassIds: [],
    imagesSelecting: true
  }
})

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get classFilter () {
    const wrapper = this.wrapper.find('class-filter-stub')
    return {
      // vue/test-utils does not correctly detect the options prop of the stub,
      // even if we make it a custom stub of our own. Since we only assert on the
      // length of options, this is enough to get around it.
      options: (wrapper.attributes('options') || '').split(',')
    }
  }
}

it('matches the snapshot', () => {
  const wrapper = shallowMount(ClassFilter, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('renders only classes belonging to dataset', () => {
  const wrapper = shallowMount(ClassFilter, { localVue, mocks, propsData, store })
  const model = new Model(wrapper)
  expect(model.classFilter.options.length).toBe(2)
})

describe('filtering by class filter', () => {
  it('filters by positive class when class selected', () => {
    const wrapper = shallowMount(ClassFilter, { localVue, mocks, propsData, store })
    const component = wrapper.vm as any

    component.onSelectedClassChange({ positiveOptions: [1, 2] })
    expect(nthEmitted(wrapper, 'update:positive-class-ids', 0)).toEqual([[1, 2]])
    expect(nthEmitted(wrapper, 'change', 0)).toEqual([{ positiveOptions: [1, 2] }])

    component.onSelectedClassChange({ positiveOptions: [] })
    expect(nthEmitted(wrapper, 'update:positive-class-ids', 1)).toEqual([[]])
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([{ positiveOptions: [] }])
  })

  it('filters by negative class when class selected', () => {
    const wrapper = shallowMount(ClassFilter, { localVue, mocks, propsData, store })
    const component = wrapper.vm as any

    component.onSelectedClassChange({ negativeOptions: [1, 2] })
    expect(nthEmitted(wrapper, 'update:negative-class-ids', 0)).toEqual([[1, 2]])
    expect(nthEmitted(wrapper, 'change', 0)).toEqual([{ negativeOptions: [1, 2] }])

    component.onSelectedClassChange({ negativeOptions: [] })
    expect(nthEmitted(wrapper, 'update:negative-class-ids', 1)).toEqual([[]])
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([{ negativeOptions: [] }])
  })
})
