import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { buildDatasetPayload, buildDatasetReportPayload } from 'test/unit/factories'
import { bottle, flask, scale } from 'test/unit/fixtures/annotation-class-payloads'

import ClassSelection from '@/components/ModelCreation/ClassSelection.vue'
import { ModelType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs = ['router-link']

let store: ReturnType<typeof createTestStore>

const model = {
  tabs: 'gray-rounded-tabs-stub',
  types: 'class-distribution-annotation-types-stub',
  table: 'class-distribution-table-stub'
}

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  store.commit('aclass/PUSH_CLASSES', [bottle, flask, scale])

  const dataset = buildDatasetPayload({ id: 5 })
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', dataset)

  const report = buildDatasetReportPayload({
    id: 5,
    class_distribution_by_annotation_instance: [
      { id: bottle.id, count: 10, name: bottle.name },
      { id: flask.id, count: 15, name: flask.name },
      { id: scale.id, count: 20, name: scale.name }
    ],
    class_distribution_by_item: [
      { id: bottle.id, count: 2, name: bottle.name },
      { id: flask.id, count: 3, name: flask.name },
      { id: scale.id, count: 7, name: scale.name }
    ]
  })
  store.commit('neuralModel/SET_NEW_MODEL_CLASS_COUNTS', report)
})

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassSelection, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when no classes', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_ANNOTATION_CLASSES', [])
  })

  it('assigns type distribution to type component', () => {
    const wrapper = shallowMount(ClassSelection, { localVue, store, stubs })

    // sanity check, to make sure we don't somehow fully break behavior
    expect(store.state.aclass.types.filter(t => t.granularity === 'main').length).toBeGreaterThan(0)

    expect(
      wrapper.find('class-distribution-annotation-types-stub').props('distribution').length
    ).toEqual(store.state.aclass.types.filter(t => t.granularity === 'main').length)
  })

  itMatchesSnapshot()
})

describe('when classes loaded', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_ANNOTATION_CLASSES', [bottle, flask, scale])
  })

  itMatchesSnapshot()

  it('matches snapshot on images tab', async () => {
    const wrapper = shallowMount(ClassSelection, { localVue, store, stubs })
    await wrapper.find(model.tabs).vm.$emit('update:currentTab', 'images')
    expect(wrapper).toMatchSnapshot()
  })

  it('assigns type distribution based on dimension', async () => {
    const wrapper = shallowMount(ClassSelection, { localVue, store, stubs })

    expect(wrapper.find(model.types).props('distribution')).toEqual([
      expect.objectContaining({ total: 20 }),
      expect.objectContaining({ total: 0 }),
      expect.objectContaining({ total: 0 }),
      expect.objectContaining({ total: 0 }),
      expect.objectContaining({ total: 0 }),
      expect.objectContaining({ total: 0 }),
      expect.objectContaining({ total: 25 }),
      expect.objectContaining({ total: 0 }),
      expect.objectContaining({ total: 0 })
    ])

    await wrapper.find(model.tabs).vm.$emit('update:currentTab', 'files')

    expect(wrapper.find(model.types).props('distribution')).toEqual([
      expect.objectContaining({ total: 7 }),
      expect.objectContaining({ total: 0 }),
      expect.objectContaining({ total: 0 }),
      expect.objectContaining({ total: 0 }),
      expect.objectContaining({ total: 0 }),
      expect.objectContaining({ total: 0 }),
      expect.objectContaining({ total: 5 }),
      expect.objectContaining({ total: 0 }),
      expect.objectContaining({ total: 0 })
    ])
  })

  it('assigns class distribution to table component', () => {
    const wrapper = shallowMount(ClassSelection, { localVue, store, stubs })
    expect(wrapper.find(model.table).props('distributions')).toEqual([
      expect.objectContaining({ countByImages: 2, countByInstances: 10 }),
      expect.objectContaining({ countByImages: 3, countByInstances: 15 }),
      expect.objectContaining({ countByImages: 7, countByInstances: 20 })
    ])
  })
})

it('auto-selects classes with > 100 instances', () => {
  store.commit('neuralModel/SET_NEW_MODEL_ANNOTATION_CLASSES', [])
  // only supports polygons
  store.commit('neuralModel/SET_NEW_MODEL_TYPE', ModelType.InstanceSegmentation)
  store.commit('dataset/PUSH_REPORT', buildDatasetReportPayload({
    id: 5,
    class_distribution_by_annotation_instance: [
      { id: bottle.id, count: 20, name: 'Bottle' },
      { id: flask.id, count: 101, name: 'Flask' },
      { id: scale.id, count: 101, name: 'Scale' }
    ]
  }))
  expect(store.state.neuralModel.newModelSelectedClassIds).toEqual([])
  shallowMount(ClassSelection, { localVue, store, stubs })

  // 2 polygons, bounding box
  store.commit('neuralModel/SET_NEW_MODEL_ANNOTATION_CLASSES', [bottle, flask, scale])

  // component should auto-select only flask, since it's supported by type and has > 100 instances
  expect(store.state.neuralModel.newModelSelectedClassIds).toEqual([])
})

it('passes dimension to table, based on selected tab', async () => {
  const wrapper = shallowMount(ClassSelection, { localVue, store, stubs })
  expect(wrapper.find(model.table).props('dimension')).toEqual('countByInstances')

  await wrapper.find(model.tabs).vm.$emit('update:currentTab', 'files')
  expect(wrapper.find(model.table).props('dimension')).toEqual('countByImages')

  await wrapper.find(model.tabs).vm.$emit('update:currentTab', 'instances')
  expect(wrapper.find(model.table).props('dimension')).toEqual('countByInstances')
})
