// TODO: Add more tests for initial select for the first item
import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { VueConstructor } from 'vue/types/umd'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildMembershipPayload,
  buildTeamPayload,
  buildUserPayload
} from 'test/unit/factories'

import ItemsLoader from '@/components/WorkView/Renderless/ItemsLoader'
import { DatasetItemsLoadingState } from '@/store/types'

let localVue: VueConstructor<Vue>

const sfh = buildDatasetPayload({ id: 1, work_prioritization: 'inserted_at:desc' })
const v7 = buildTeamPayload({ id: 7 })
const joe = buildUserPayload({ id: 5 })
const joeMembership = buildMembershipPayload({ id: 1, user_id: 5, team_id: 7 })

let store: ReturnType<typeof createTestStore>
let mocks: {
  $route: {
    name: 'Workflow',
    params: {},
    query: { dataset?: string, image?: string }
  },
  $router: {
    replace: jest.Mock
  }
}

beforeEach(() => {
  localVue = createLocalVue()
  localVue.use(Vuex)

  store = createTestStore()

  store.commit('workview/SET_DATASET', sfh)
  store.commit('user/SET_PROFILE', joe)
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', [joeMembership])

  jest.spyOn(store, 'dispatch').mockResolvedValue({
    data: {
      items: [buildDatasetItemPayload()],
      metadata: { previous: 'previous', next: 'next' }
    }
  })

  mocks = {
    $route: {
      name: 'Workflow',
      params: {},
      query: {
        dataset: sfh.id.toString()
      }
    },
    $router: {
      replace: jest.fn()
    }
  }
})

it('dispatches main page on mount', async () => {
  const wrapper = shallowMount(ItemsLoader, { localVue, mocks, store })
  jest.spyOn(store, 'commit').mockReturnValue(undefined)
  wrapper.vm.$route.query = { image: '3' }

  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith(
    'workview/loadDatasetItems',
    expect.objectContaining({ datasetId: sfh.id, page: { contains_seq: 3 } })
  )
  expect(store.dispatch).toHaveBeenCalledWith('workview/loadDatasetFolders')

  await flushPromises()
  expect(store.commit).toHaveBeenCalledWith(
    'workview/ENQUEUE_DATASET_ITEM_PAGE',
    { from: 'next', size: 50 }
  )

  expect(store.commit).toHaveBeenCalledWith(
    'workview/ENQUEUE_DATASET_ITEM_PAGE',
    { to: 'previous', size: 50 }
  )
})

describe('after initial mount', () => {
  beforeEach(async () => {
    store.commit('workview/CLEAR_DATASET_ITEM_PAGE_REGISTRY')
    store.commit('workview/RESET_DATASET_ITEM_CURSOR_MAPPING')
    store.commit('workview/CLEAR_DATASET_ITEMS')
    await flushPromises()
  })

  it('dispatches load on page queue change', async () => {
    const wrapper = shallowMount(ItemsLoader, { localVue, mocks, store })
    wrapper.vm.$route.query = { image: '3' }

    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith(
      'workview/loadDatasetItems',
      expect.objectContaining({ datasetId: sfh.id, page: { from: 'next', size: 50 } })
    )
    expect(store.dispatch).toHaveBeenCalledWith('workview/loadDatasetFolders')
  })

  it('dispatches load on filter change', async () => {
    const wrapper = shallowMount(ItemsLoader, { localVue, mocks, store })
    wrapper.vm.$route.query = { image: '3' }

    store.commit('workview/SET_DATASET_ITEMS_FILTER', { assignees: [] })
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith(
      'workview/loadDatasetItems',
      expect.objectContaining({ datasetId: sfh.id, page: { from: 'next', size: 50 } })
    )
    expect(store.dispatch).toHaveBeenCalledWith('workview/loadDatasetFolders')
  })

  it('loads first page if no results upon main page load', async () => {
    const wrapper = shallowMount(ItemsLoader, { localVue, mocks, store })
    wrapper.vm.$route.query = { image: '3' }

    store.commit('workview/ENQUEUE_DATASET_ITEM_PAGE', { to: 'previous', size: 50 })
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith(
      'workview/loadDatasetItems',
      expect.objectContaining({ datasetId: sfh.id, page: { to: 'previous', size: 50 } })
    )
    expect(store.dispatch).toHaveBeenCalledWith('workview/loadDatasetFolders')
  })
})

describe('in tutorial mode', () => {
  beforeEach(async () => {
    store.commit('workview/SET_TUTORIAL_MODE', true)
    store.commit('workview/CLEAR_DATASET_ITEM_PAGE_REGISTRY')
    store.commit('workview/RESET_DATASET_ITEM_CURSOR_MAPPING')
    store.commit('workview/CLEAR_DATASET_ITEMS')
    await flushPromises()
  })

  it('never loads dataset folders', async () => {
    const wrapper = shallowMount(ItemsLoader, { localVue, mocks, store })
    wrapper.vm.$route.query = { image: '3' }

    await flushPromises()
    expect(store.dispatch).not.toHaveBeenCalledWith('workview/loadDatasetFolders')
  })
})

describe('item selection', () => {
  const items = [
    buildDatasetItemPayload({ id: 11, seq: 111 }),
    buildDatasetItemPayload({ id: 22, seq: 222 })
  ]

  beforeEach(() => {
    store.commit('workview/SET_DATASET_ITEMS_LOADING', DatasetItemsLoadingState.Loaded)

    // We are forced to do this "deep mock" due to component not being written
    // in a very testable way. We need to write better in the future.
    // Component will enqueue main page, clear all items from store, then
    // compute redirection to an available item
    store.dispatch = jest.fn().mockImplementation(() => {
      store.commit('workview/PUSH_DATASET_ITEMS', items)
      return {
        data: {
          items,
          metadata: { previous: 'previous', next: 'next' }
        }
      }
    })
  })

  it('selects matched item on mount', async () => {
    shallowMount(ItemsLoader, { localVue, mocks, store })
    await flushPromises()

    mocks.$route.query = { dataset: sfh.id.toString(), image: '222' }
    await flushPromises()
    expect(store.state.workview.selectedDatasetItem).toEqual(items[1])

    mocks.$route.query = { dataset: sfh.id.toString(), image: '111' }
    await flushPromises()
    expect(store.state.workview.selectedDatasetItem).toEqual(items[0])
  })

  it('redirects to first available item if not matched', async () => {
    shallowMount(ItemsLoader, { localVue, mocks, store })
    await flushPromises()

    mocks.$route.query = { dataset: mocks.$route.query.dataset, image: '333' }
    await flushPromises()

    expect(mocks.$router.replace).toHaveBeenCalledWith({
      params: {},
      query: { dataset: sfh.id.toString(), image: '111' }
    })
  })
})
