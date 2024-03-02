import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildDatasetExportPayload,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildTeamPayload
} from 'test/unit/factories'

import V2ExportDialog from '@/components/DatasetManagement/ExportDialog/V2/V2ExportDialog.vue'
import { installCommonComponents } from '@/plugins/components'
import {
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

  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', currentTeam)
  store.commit('dataset/SET_CURRENT_DATASET_ID', 1)
  store.commit('dataset/SET_DATASETS', [dataset])
  store.commit('dataset/SET_DATASET_ITEMS', items)

  store.dispatch = jest.fn().mockImplementation((action: string) => {
    if (action === 'dataset/getV2Exports') {
      return Promise.resolve([buildDatasetExportPayload()])
    }
    return Promise.resolve({})
  })
})

const itMatchesSnapshot = (): void => {
  it('matches snaphsot', async () => {
    const wrapper = shallowMount(V2ExportDialog, { localVue, mocks, store })
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when the modal is shown', () => {
  itMatchesSnapshot()

  it('dispatch actions to load data', () => {
    const wrapper = shallowMount(V2ExportDialog, { localVue, mocks, store })
    const vm = wrapper.vm as any
    vm.show()

    expect(store.dispatch).toBeCalledWith('dataset/getV2Exports', {
      datasetSlug: 'sfh',
      teamSlug: 'v7'
    })
    expect(mocks.$modal.show).toBeCalledWith('export')
  })
})

it('clears export from route query on closed', async () => {
  const wrapper = shallowMount(V2ExportDialog, { localVue, store, mocks })

  // we need to verify the call does not happen if no export param in route, as
  // that would trigger a router error
  await wrapper.find('custom-button-stub[variant="outline"]').vm.$emit('click')
  expect(mocks.$router.push).not.toHaveBeenCalled()

  mocks.$route.query.export = 'true'
  await wrapper.find('custom-button-stub[variant="outline"]').vm.$emit('click')
  expect(mocks.$router.push).toHaveBeenCalledWith({ query: {export: undefined } })
})
