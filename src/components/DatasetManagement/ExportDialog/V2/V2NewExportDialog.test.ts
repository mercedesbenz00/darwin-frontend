import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotationClassPayload,
  buildDatasetDetailPayload,
  buildDatasetExportPayload,
  buildDatasetPayload,
  buildTeamPayload,
  buildV2DatasetItemPayload
} from 'test/unit/factories'

import V2NewExportDialog from '@/components/DatasetManagement/ExportDialog/V2/V2NewExportDialog.vue'
import ToastController from '@/plugins/ToastController'
import { installCommonComponents } from '@/plugins/components'
import { ExportV2Params } from '@/store/modules/dataset/types'
import {
  AnnotationClassPayload,
  DatasetDetailPayload,
  DatasetItemStatus,
  DatasetPayload,
  TeamPayload,
  V2DatasetItemPayload
} from '@/store/types'
import { pluralize } from '@/utils'

const localVue = createLocalVue()
installCommonComponents(localVue)
localVue.use(VModal)
localVue.use(Vuex)
localVue.use(ToastController)
localVue.filter('pluralize', pluralize)
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.directive('loading', () => {})

let store: ReturnType<typeof createTestStore>

const mocks = {
  $modal: { show: jest.fn(), hide: jest.fn() },
  $route: { name: '', params: {}, query: {} },
  $router: { push: jest.fn(), replace: jest.fn() }
}

let items: V2DatasetItemPayload[]
let currentTeam: TeamPayload
let annotationClasses: AnnotationClassPayload[]
let dataset: DatasetPayload

beforeEach(() => {
  dataset = buildDatasetPayload({ id: 1, slug: 'sfh', team_slug: 'v7' })
  currentTeam = buildTeamPayload({ id: 1 })

  items = [
    buildV2DatasetItemPayload({
      id: 'a',
      dataset_id: dataset.id,
      status: DatasetItemStatus.annotate
    }),
    buildV2DatasetItemPayload({
      id: 'b',
      dataset_id: dataset.id,
      status: DatasetItemStatus.annotate
    }),
    buildV2DatasetItemPayload({
      id: 'c',
      dataset_id: dataset.id,
      status: DatasetItemStatus.annotate
    })
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
    if (action === 'dataset/getV2Exports') {
      return Promise.resolve([buildDatasetExportPayload()])
    }
    return Promise.resolve({})
  })
})

const model = {
  exportButton: 'custom-button-stub.button__export',
  nameField: '.modal__content__new__input__field',
  classFilter: 'vue-tags-input-stub',
  exportType: '.modal__content__new__status__radio__current_filters'
}

describe('when the modal is shown', () => {
  it('dispatch actions to load data', () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    const vm = wrapper.vm as unknown as { show: Function }
    vm.show()

    expect(store.dispatch).toBeCalledWith('dataset/loadV2DatasetItemCounts', { dataset })
    expect(mocks.$modal.show).toBeCalledWith('new-export')
  })
})

describe('when "All Complete" option is selected', () => {
  let baseParams: ExportV2Params

  beforeEach(() => {
    store.commit('dataset/SET_V2_DATASET_ITEMS', items)
    store.commit('dataset/PUSH_DATASET_DETAILS', {
      id: dataset.id,
      status_counts: [
        { status: 'annotate', count: 2 },
        { status: 'review', count: 0 },
        { status: 'complete', count: 1 }
      ],
      item_count: [],
      commented_item_count: 0,
      unfiltered_item_count: 0,
      class_counts: []
    })
    baseParams = {
      annotationFilter: {},
      name: 'name',
      datasetSlug: dataset.slug,
      filters: {
        statuses: [DatasetItemStatus.complete]
      },
      format: 'json',
      includeAuthorship: false,
      includeExportToken: false,
      teamSlug: dataset.team_slug
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders the total number of completed items in the dataset', () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    expect(wrapper.find(model.exportButton).text()).toEqual('Export 1 Item')
  })

  it('dispatches action with proper params', async () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    wrapper.find(model.nameField).vm.$emit('change', 'name')
    await wrapper.find(model.exportButton).vm.$emit('click')

    const params = { ...baseParams }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/exportV2Dataset', params)
    expect(mocks.$modal.hide).toBeCalled()
  })

  it('dispatches action with selected annotation class ids', async () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    wrapper.find(model.classFilter).vm.$emit('tags-changed', [{ id: 1, text: 'class1' }])
    wrapper.find(model.nameField).vm.$emit('change', 'name')
    await wrapper.find(model.exportButton).vm.$emit('click')

    const params = {
      ...baseParams,
      annotationFilter: {
        annotation_class_ids: [1]
      },
      filters: {
        statuses: [DatasetItemStatus.complete]
      }
    }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/exportV2Dataset', params)
  })
})

describe('when "Current filters" option is selected', () => {
  let baseParams: ExportV2Params
  let datasetCounts: DatasetDetailPayload

  beforeEach(() => {
    datasetCounts = buildDatasetDetailPayload({ id: 1, item_count: 9 })

    store.commit('dataset/PUSH_DATASET_DETAILS', datasetCounts)

    store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', {
      annotation_class_ids: [1, 2]
    })

    baseParams = {
      annotationFilter: {},
      name: 'name',
      datasetSlug: dataset.slug,
      filters: {
        annotation_class_ids: [1, 2]
      },
      format: 'json',
      includeAuthorship: false,
      includeExportToken: false,
      teamSlug: dataset.team_slug
    }
  })

  it('matches snapshot', async () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 2 })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders filtered item count', async () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 2 })
    expect(wrapper.find(model.exportButton).text()).toEqual('Export 9 Items')
  })

  it('dispatches action with proper params', async () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 2 })
    await wrapper.find(model.nameField).vm.$emit('change', 'name')
    await wrapper.find(model.exportButton).vm.$emit('click')

    const params = { ...baseParams }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/exportV2Dataset', params)
  })
})

describe('when "Current filters" is selected and counts not yet loaded', () => {
  beforeEach(() => {
    store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', {
      annotation_class_ids: [1, 2]
    })
  })

  it('matches snapshot', async () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 2 })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders "N/A" as item count', async () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 2 })
    expect(wrapper.find(model.exportButton).text()).toEqual('Export N/A Items')
  })
})

describe('when "Selected" option is selected', () => {
  let baseParams: ExportV2Params

  beforeEach(() => {
    store.commit('dataset/UPDATE_V2_ITEM_SELECTION', {
      items: [items[0], items[1]],
      selected: true
    })

    baseParams = {
      annotationFilter: {},
      name: 'name',
      datasetSlug: dataset.slug,
      filters: {
        item_ids: [items[0].id, items[1].id]
      },
      format: 'json',
      includeAuthorship: false,
      includeExportToken: false,
      teamSlug: dataset.team_slug
    }
  })

  it('matches snapshot', async () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 3 })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders number of selected items', async () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 3 })
    expect(wrapper.find(model.exportButton).text()).toContain('Export 2 Items')
  })

  it('exports selected images', async () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, mocks, store })
    await wrapper.find(model.exportType).vm.$emit('input', { id: 3 })
    await wrapper.find(model.nameField).vm.$emit('change', 'name')
    await wrapper.find(model.exportButton).vm.$emit('click')

    const params = { ...baseParams }
    expect(store.dispatch).toHaveBeenCalledWith('dataset/exportV2Dataset', params)
  })
})

describe('when no images are completed', () => {
  beforeEach(() => {
    store.commit('dataset/SET_V2_DATASET_ITEMS', [])
    store.commit('dataset/SET_EXPORT_COMPLETE_COUNT', 0)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, store, mocks })
    expect(wrapper).toMatchSnapshot()
  })

  it('disables export button', () => {
    const wrapper = shallowMount(V2NewExportDialog, { localVue, store, mocks })
    expect(wrapper.find(model.exportButton).attributes('disabled')).toBe('true')
  })
})
