import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { Gallery } from 'test/unit/stubs'

import ClassesGallery from '@/components/Classes/ClassesGallery.vue'
import { VIEW_MODE } from '@/components/Common/Gallery/types'
import {
  AnnotationClassPayload,
  DatasetPayload
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: {
  classes: AnnotationClassPayload[]
  loading?: boolean
  dataset?: DatasetPayload | null
}
const stubs = { Gallery }
const v7 = buildTeamPayload({})
const classes = [
  buildAnnotationClassPayload({ id: 1 }),
  buildAnnotationClassPayload({ id: 2 })
]
const mocks = { $can: () => true }

let store: ReturnType<typeof createTestStore>
beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  propsData = { classes }
})

describe('card mode', () => {
  beforeEach(() => {
    store.commit('aclass/SET_CLASSES_TAB_VIEW_MODE', VIEW_MODE.CARD)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassesGallery, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('should select annotation class', async () => {
    const wrapper = shallowMount(ClassesGallery, { localVue, mocks, propsData, store, stubs })
    await wrapper.findAll('class-card-stub').at(0).vm.$emit('select', {
      id: classes[0].id,
      selected: true
    })
    expect(store.dispatch).toHaveBeenCalledWith('aclass/setClassSelections', {
      selections: [{ id: classes[0].id, selected: true }]
    })
  })

  it('should emit edit', async () => {
    const wrapper = shallowMount(ClassesGallery, { localVue, mocks, propsData, store, stubs })
    await wrapper.findAll('class-card-stub').at(0).vm.$emit('edit')
    expect(wrapper.emitted().edit).toEqual([[classes[0]]])
  })

  it('should select all annotation classes', async () => {
    const wrapper = shallowMount(ClassesGallery, { localVue, mocks, propsData, store, stubs })
    await wrapper.find('.gallery').vm.$emit('select-all', true)
    expect(store.dispatch).toHaveBeenCalledWith('aclass/setClassSelections', {
      selections: [
        { id: classes[0].id, selected: true },
        { id: classes[1].id, selected: true }
      ]
    })
  })

  it('should de-select all annotation classes', async () => {
    const wrapper = shallowMount(ClassesGallery, { localVue, mocks, propsData, store, stubs })
    await wrapper.find('.gallery').vm.$emit('select-all', false)
    expect(store.dispatch).toHaveBeenCalledWith('aclass/setClassSelections', {
      selections: [
        { id: classes[0].id, selected: false },
        { id: classes[1].id, selected: false }
      ]
    })
  })
})

describe('list mode', () => {
  beforeEach(() => {
    store.commit('aclass/SET_CLASSES_TAB_VIEW_MODE', VIEW_MODE.LIST)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassesGallery, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('classes is empty', () => {
  beforeEach(() => {
    propsData.classes = []
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassesGallery, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('with dataset', () => {
  const dataset = buildDatasetPayload({})

  beforeEach(() => {
    propsData.dataset = dataset
  })

  it('should add annotation class to the dataset', async () => {
    const wrapper = shallowMount(ClassesGallery, { localVue, mocks, propsData, store, stubs })
    await wrapper.findAll('class-card-stub').at(0).vm.$emit('add-to-dataset')
    expect(store.dispatch).toHaveBeenCalledWith('aclass/addToDataset', {
      annotationClass: classes[0],
      dataset
    })
  })

  it('should remove annotation class from the dataset', async () => {
    const wrapper = shallowMount(ClassesGallery, { localVue, mocks, propsData, store, stubs })
    await wrapper.findAll('class-card-stub').at(0).vm.$emit('remove-from-dataset')
    expect(store.dispatch).toHaveBeenCalledWith('aclass/removeFromDataset', {
      annotationClass: classes[0],
      dataset
    })
  })
})
