import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildDatasetReportPayload,
  buildTeamPayload
} from 'test/unit/factories'

import OverviewContent from '@/components/Dataset/DatasetDetail/Overview/OverviewContent.vue'
import { AnnotationClassPayload, DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs: Stubs = {
  'dataset-progress-section': true,
  'class-distribution-table': true
}

let store: ReturnType<typeof createTestStore>

const currentDataset = buildDatasetPayload({ id: 1 })
const annotationClasses: AnnotationClassPayload[] = [
  buildAnnotationClassPayload({
    id: 1,
    metadata: { _color: 'rgba(5,10,15,1.0)' },
    team_id: 1,
    description: '',
    images: [],
    name: 'Foo',
    inserted_at: new Date().toISOString(),
    annotation_types: ['bounding_box'],
    datasets: [{ id: currentDataset.id }]
  }),
  buildAnnotationClassPayload({
    id: 2,
    metadata: { _color: 'rgba(10,15,20,1.0)' },
    team_id: 1,
    description: '',
    images: [],
    name: 'Bar',
    inserted_at: new Date().toISOString(),
    annotation_types: ['polygon'],
    datasets: [{ id: currentDataset.id }]
  }),
  buildAnnotationClassPayload({
    id: 3,
    metadata: { _color: 'rgba(15,20,25,1.0)' },
    team_id: 1,
    description: '',
    images: [],
    name: 'Baz',
    inserted_at: new Date().toISOString(),
    annotation_types: ['bounding_box'],
    datasets: [{ id: currentDataset.id }]
  })
]

const report = buildDatasetReportPayload({
  id: currentDataset.id,
  progress: 0.5,
  annotator_count: 0,
  class_distribution_by_item: [
    { id: 1, count: 40, name: 'Foo' },
    { id: 2, count: 20, name: 'Bar' },
    { id: 3, count: 10, name: 'Baz' }
  ],
  class_distribution_by_annotation_instance: [
    { id: 1, count: 11, name: 'Foo' },
    { id: 2, count: 22, name: 'Bar' },
    { id: 3, count: 44, name: 'Baz' }
  ]
})

const v7 = buildTeamPayload({ id: 1 })
let propsData: {
  dataset: DatasetPayload
}

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  store.commit('aclass/SET_CLASSES', annotationClasses)
  store.commit('dataset/PUSH_REPORT', report)
  store.commit('team/SET_CURRENT_TEAM', v7)
  propsData = {
    dataset: currentDataset
  }
})

it('renders list of class counts per loaded from store, per image and per instance', () => {
  const wrapper = shallowMount(OverviewContent, { localVue, propsData, store, stubs })

  expect(wrapper).toMatchSnapshot()
})

it('should load report', () => {
  shallowMount(OverviewContent, { localVue, propsData, store, stubs })
  expect(store.dispatch).toHaveBeenCalledWith('dataset/getReport', {
    datasetId: currentDataset.id
  })
})
