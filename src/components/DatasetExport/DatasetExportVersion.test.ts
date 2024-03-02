import { shallowMount, createLocalVue } from '@vue/test-utils'
import { clear, advanceTo } from 'jest-date-mock'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotationTypePayload,
  buildDatasetDetailPayload,
  buildDatasetExportPayload,
  buildDatasetPayload,
  buildTeamPayload,
  buildUserPayload
} from 'test/unit/factories'

import DatasetExportVersion from '@/components/DatasetExport/DatasetExportVersion.vue'
import { IsAuthorized } from '@/store/modules/auth/getters/isAuthorized'
import { DatasetExportPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>

const annotationTypes = [
  buildAnnotationTypePayload({ id: 1 }),
  buildAnnotationTypePayload({ id: 2 })
]

const datasetExport = buildDatasetExportPayload({
  name: 'version1',
  metadata: {
    annotation_types: [{ id: 1, count: 2 }, { id: 2, count: 5 }],
    annotation_classes: [
      { id: 1, name: '1' },
      { id: 2, name: '2' },
      { id: 3, name: '3' },
      { id: 4, name: '4' },
      { id: 5, name: '5' }
    ],
    num_images: 10
  }
})

let mocks: { $can: IsAuthorized }

const dataset = buildDatasetPayload({ id: 1 })

let propsData: {
  datasetExport: DatasetExportPayload,
  datasetSlug: string,
  teamSlug: string
}

beforeEach(() => {
  store = createTestStore()

  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', buildDatasetDetailPayload({ id: dataset.id }))
  store.commit('dataset/PUSH_DATASET', dataset)

  propsData = {
    datasetExport,
    datasetSlug: 'dataset',
    teamSlug: 'v7'
  }

  mocks = {
    $can: (ability) => {
      if (!['export_dataset', 'view_dataset_exports'].includes(ability)) {
        throw new Error(`Component is checking unexpected ability: ${ability}`)
      }

      return true
    }
  }
})

afterEach(() => clear)

describe('when you are an admin of this team', () => {
  const v7 = buildTeamPayload({ id: 7 })
  const joe = buildUserPayload({ id: 5 })

  beforeEach(() => {
    store.commit('user/SET_PROFILE', joe)
    store.commit('team/SET_CURRENT_TEAM', v7)
  })

  it('matches snapshot', () => {
    advanceTo(new Date('2019-12-19T00:00:00Z'))
    const wrapper = shallowMount(DatasetExportVersion, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot with download url', () => {
    advanceTo(new Date('2019-12-19T00:00:00Z'))
    propsData.datasetExport = buildDatasetExportPayload({ download_url: 'download-url' })
    const wrapper = shallowMount(DatasetExportVersion, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot when metadata is empty', () => {
    advanceTo(new Date('2019-12-19T00:00:00Z'))
    store.commit('aclass/SET_TYPES', annotationTypes)
    propsData.datasetExport = buildDatasetExportPayload({ metadata: null })
    const wrapper = shallowMount(DatasetExportVersion, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('delete dataset export when trash button is clicked', async () => {
    advanceTo(new Date('2019-12-19T00:00:00Z'))
    store.commit('aclass/SET_TYPES', annotationTypes)
    propsData.datasetExport = buildDatasetExportPayload({ name: 'version1' })
    const wrapper = shallowMount(DatasetExportVersion, { localVue, mocks, propsData, store })

    await wrapper.find('button.dataset-export__header__trash-button').trigger('click')
    expect(store.dispatch).toBeCalledWith('dataset/deleteExport', { datasetId: 1, name: 'version1' })
  })
})

describe('when you are a workforce manager of this team', () => {
  const v7 = buildTeamPayload({ id: 7 })
  const joe = buildUserPayload({ id: 5 })

  beforeEach(() => {
    store.commit('user/SET_PROFILE', joe)
    store.commit('team/SET_CURRENT_TEAM', v7)
    mocks.$can = (ability) => {
      if (!['export_dataset', 'view_dataset_exports'].includes(ability)) {
        throw new Error(`Component is checking unexpected ability: ${ability}`)
      }

      return false
    }
  })

  it('matches snapshot', () => {
    advanceTo(new Date('2019-12-19T00:00:00Z'))
    const wrapper = shallowMount(DatasetExportVersion, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot with download url', () => {
    advanceTo(new Date('2019-12-19T00:00:00Z'))
    propsData.datasetExport = buildDatasetExportPayload({ download_url: 'download-url' })
    const wrapper = shallowMount(DatasetExportVersion, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('nothing happens when trash button is clicked', async () => {
    advanceTo(new Date('2019-12-19T00:00:00Z'))
    const wrapper = shallowMount(DatasetExportVersion, { localVue, mocks, propsData, store })
    await wrapper.find('button.dataset-export__header__trash-button').trigger('click')
    expect(store.dispatch).not.toBeCalled()
  })
})
