import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotationClassPayload,
  buildDatasetDetailPayload,
  buildDatasetExportPayload,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildTeamPayload
} from 'test/unit/factories'

import ExportDialog from '@/components/DatasetManagement/ExportDialog/V1/ExportDialog.vue'
import { installCommonComponents } from '@/plugins/components'
import { ExportDatasetParams } from '@/store/modules/dataset/types'
import {
  AnnotationClassPayload,
  DatasetDetailPayload,
  DatasetItemPayload,
  DatasetItemStatus,
  DatasetPayload,
  TeamPayload
} from '@/store/types'
import { pluralize } from '@/utils'

const localVue = createLocalVue()
installCommonComponents(localVue)
localVue.use(VModal)
localVue.use(Vuex)
localVue.filter('pluralize', pluralize)
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.directive('loading', () => {})

let store: ReturnType<typeof createTestStore>

let mocks: {
  $modal: { show: () => void, hide: () => void }
  $route: { name: 'DatasetManagement', params: {}, query: { export?: string } },
  $router: { push: () => void }
}

let items: DatasetItemPayload[]
let currentTeam: TeamPayload
let annotationClasses: AnnotationClassPayload[]
let dataset: DatasetPayload

beforeEach(() => {
  mocks = {
    $modal: { show: jest.fn(), hide: jest.fn() },
    $route: { name: 'DatasetManagement', params: {}, query: { } },
    $router: { push: jest.fn() }
  }

  dataset = buildDatasetPayload({ id: 1, slug: 'sfh', team_slug: 'v7' })
  currentTeam = buildTeamPayload({ id: 1 })

  items = [
    buildDatasetItemPayload({ id: 1, dataset_id: dataset.id, status: DatasetItemStatus.annotate }),
    buildDatasetItemPayload({ id: 2, dataset_id: dataset.id, status: DatasetItemStatus.annotate }),
    buildDatasetItemPayload({ id: 3, dataset_id: dataset.id, status: DatasetItemStatus.annotate })
  ]

  annotationClasses = [
    buildAnnotationClassPayload({ id: 1, name: 'class1' }),
    buildAnnotationClassPayload({ id: 2, name: 'class2' }),
    buildAnnotationClassPayload({ id: 3, name: 'class3' })
  ]

  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', currentTeam)
  store.commit('dataset/SET_CURRENT_DATASET_ID', 1)
  store.commit('dataset/SET_DATASETS', [dataset])
  store.commit('dataset/SET_DATASET_ITEMS', items)

  store.commit('dataset/SET_EXPORT_COMPLETE_COUNT', 1)
  store.commit('aclass/SET_CLASSES', annotationClasses)

  store.dispatch = jest.fn().mockImplementation((action: string) => {
    if (action === 'dataset/getDatasetExports') {
      return Promise.resolve([buildDatasetExportPayload()])
    }
    return Promise.resolve({})
  })
})

const model = {
  exportButton: 'positive-button-stub.button__export',
  nameField: '.modal__content__new__input__field',
  classFilter: 'vue-tags-input-stub',
  exportType: '.modal__content__new__status__radio__current_filters'
}

describe('when the modal is shown', () => {
  it('dispatch actions to load data', () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    const vm = wrapper.vm as any
    vm.show()

    expect(store.dispatch).toBeCalledWith('dataset/getDatasetExports', { datasetId: 1 })
    expect(store.dispatch).toBeCalledWith('dataset/getExportCompleteCount', {
      datasetSlug: 'sfh',
      teamSlug: 'v7'
    })
    expect(mocks.$modal.show).toBeCalledWith('export')
  })
})

describe('when "All Complete" option is selected', () => {
  let baseParams: ExportDatasetParams

  beforeEach(() => {
    store.commit('dataset/SET_DATASET_ITEMS', items)
    baseParams = {
      annotationFilter: {},
      name: 'name',
      datasetId: dataset.id,
      filter: {
        statuses: [DatasetItemStatus.complete]
      },
      format: 'json',
      includeAuthorship: false,
      includeExportToken: false
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders the total number of completed items in the dataset', () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    expect(wrapper.find(model.exportButton).text()).toEqual('EXPORT 1 ITEM')
  })

  it('dispatches action with proper params', async () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    wrapper.find(model.nameField).vm.$emit('change', 'name')
    await wrapper.find(model.exportButton).vm.$emit('click')

    const params = { ...baseParams }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/exportDataset', params)
    expect(mocks.$modal.hide).toBeCalled()
  })

  it('dispatches action with selected annotation class ids', async () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    wrapper.find(model.classFilter).vm.$emit('tags-changed', [{ id: 1, text: 'class1' }])
    wrapper.find(model.nameField).vm.$emit('change', 'name')
    await wrapper.find(model.exportButton).vm.$emit('click')

    const params = {
      ...baseParams,
      annotationFilter: {
        annotation_class_ids: [1]
      },
      filter: {
        statuses: [DatasetItemStatus.complete]
      }
    }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/exportDataset', params)
  })
})

describe('when "Current filters" option is selected', () => {
  let baseParams: ExportDatasetParams
  let datasetCounts: DatasetDetailPayload

  beforeEach(() => {
    datasetCounts = buildDatasetDetailPayload({ id: 1, item_count: 9 })

    store.commit('dataset/PUSH_DATASET_DETAILS', datasetCounts)

    store.commit('dataset/SET_DATASET_ITEMS_FILTER', {
      annotation_class_ids: [1, 2],
      path: '/'
    })

    baseParams = {
      annotationFilter: {},
      name: 'name',
      datasetId: dataset.id,
      filter: {
        annotation_class_ids: [1, 2]
      },
      format: 'json',
      includeAuthorship: false,
      includeExportToken: false
    }
  })

  it('matches snapshot', async () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 2 })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders filtered item count', async () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 2 })
    expect(wrapper.find(model.exportButton).text()).toEqual('EXPORT 9 ITEMS')
  })

  it('dispatches action with proper params', async () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 2 })
    await wrapper.find(model.nameField).vm.$emit('change', 'name')
    await wrapper.find(model.exportButton).vm.$emit('click')

    const params = { ...baseParams }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/exportDataset', params)
  })

  it('includes path in params, if folders are enabled', async () => {
    store.commit('dataset/SET_FOLDER_ENABLED', true)
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 2 })
    await wrapper.find(model.nameField).vm.$emit('change', 'name')
    await wrapper.find(model.exportButton).vm.$emit('click')

    const params = {
      ...baseParams,
      filter: {
        ...baseParams.filter,
        path: '/'
      }
    }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/exportDataset', params)
  })
})

describe('when "Current filters" is selected and counts not yet loaded', () => {
  beforeEach(() => {
    store.commit('dataset/SET_DATASET_ITEMS_FILTER', {
      annotation_class_ids: [1, 2],
      path: '/'
    })
  })

  it('matches snapshot', async () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 2 })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders "N/A" as item count', async () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 2 })
    expect(wrapper.find(model.exportButton).text()).toEqual('EXPORT N/A ITEMS')
  })
})

describe('when "Selected" option is selected', () => {
  let baseParams: ExportDatasetParams

  beforeEach(() => {
    store.commit('dataset/UPDATE_ITEM_SELECTION', {
      items: [items[0], items[1]],
      selected: true
    })

    baseParams = {
      annotationFilter: {},
      name: 'name',
      datasetId: dataset.id,
      filter: {
        dataset_item_ids: [items[0].id, items[1].id]
      },
      format: 'json',
      includeAuthorship: false,
      includeExportToken: false
    }
  })

  it('matches snapshot', async () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 3 })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders number of selected items', async () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 3 })
    expect(wrapper.find(model.exportButton).text()).toContain('EXPORT 2 ITEMS')
  })

  it('exports selected images', async () => {
    const wrapper = shallowMount(ExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 3 })
    await wrapper.find(model.nameField).vm.$emit('change', 'name')
    await wrapper.find(model.exportButton).vm.$emit('click')

    const params = { ...baseParams }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/exportDataset', params)
  })
})

describe('when no images are completed', () => {
  beforeEach(() => {
    store.commit('dataset/SET_DATASET_ITEMS', [])
    store.commit('dataset/SET_EXPORT_COMPLETE_COUNT', 0)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ExportDialog, { localVue, store, mocks })
    expect(wrapper).toMatchSnapshot()
  })

  it('disables export button', () => {
    const wrapper = shallowMount(ExportDialog, { localVue, store, mocks })
    expect(wrapper.find(model.exportButton).attributes('disabled')).toBe('true')
  })
})

it('clears export from route query on closed', async () => {
  const wrapper = shallowMount(ExportDialog, { localVue, store, mocks })

  // we need to verify the call does not happen if no export param in route, as
  // that would trigger a router error
  await wrapper.find('.button__close').vm.$emit('click')
  expect(mocks.$router.push).not.toHaveBeenCalled()

  mocks.$route.query.export = 'true'
  await wrapper.find('.button__close').vm.$emit('click')
  expect(mocks.$router.push).toHaveBeenCalledWith({ query: {export: undefined } })
})
