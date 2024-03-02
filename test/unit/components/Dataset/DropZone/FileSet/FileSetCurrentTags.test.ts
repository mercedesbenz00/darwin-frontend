import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotationClassPayload, buildDatasetPayload } from 'test/unit/factories'

import FileSetCurrentTags from '@/components/Dataset/DropZone/FileSet/FileSetCurrentTags.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createTestStore>

let dataset: DatasetPayload
let propsData: {
  tags: string[]
  dataset: DatasetPayload
}

beforeEach(() => {
  store = createTestStore()
  dataset = buildDatasetPayload({ id: 1 })
  propsData = {
    tags: ['tag1', 'tag2'],
    dataset
  }
  store.commit('aclass/SET_CLASSES', [
    buildAnnotationClassPayload({
      id: 1,
      annotation_types: ['polygon'],
      datasets: [{ id: 1 }]
    }),
    buildAnnotationClassPayload({
      id: 2,
      annotation_types: ['tag'],
      datasets: [{ id: 1 }],
      name: 'tag1'
    }),
    buildAnnotationClassPayload({
      id: 3,
      annotation_types: ['tag'],
      datasets: [{ id: 1 }],
      name: 'tag2'
    })
  ])
})

it('matches snapshot when tags is defined', () => {
  const wrapper = shallowMount(FileSetCurrentTags, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when tags is not defined', () => {
  propsData.tags = []
  const wrapper = shallowMount(FileSetCurrentTags, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
