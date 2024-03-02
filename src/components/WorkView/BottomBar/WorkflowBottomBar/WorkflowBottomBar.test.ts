import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetImagePayload,
  buildDatasetDetailPayload,
  buildDatasetItemPayload,
  buildImagePayload,
  buildUserPayload,
  buildTeamPayload,
  buildMembershipPayload
} from 'test/unit/factories'
import { BottomBar } from 'test/unit/stubs'

import { WorkflowBottomBar } from '@/components/WorkView/BottomBar'
import Abilities from '@/plugins/abilities'
import { IsAuthorized } from '@/store/modules/auth/getters/isAuthorized'
import { MembershipPayload } from '@/store/types'

let localVue: ReturnType<typeof createLocalVue>

const sfh = buildDatasetDetailPayload({ id: 1 })

let store: ReturnType<typeof createTestStore>
let scrollBy: jest.SpyInstance
let stubs: Stubs
let mocks: {
  $theme: ReturnType<typeof createMockTheme>,
  $can: IsAuthorized
  $route: { query: { dataset?: string, task?: string, image?: string }}
}

// 1000 images
const itemCollection = Array.from(Array(1000), (x, i) => i).map(index => {
  const datasetImage = buildDatasetImagePayload({ id: index, seq: index, dataset_id: sfh.id })
  return buildDatasetItemPayload({
    id: index * 10,
    dataset_image_id: index,
    dataset_image: datasetImage,
    seq: index
  })
})
const v7 = buildTeamPayload({ id: 7 })
const joe = buildUserPayload({ id: 5 })
let joeMembership: MembershipPayload

beforeEach(() => {
  localVue = createLocalVue()
  localVue.directive('lazy', () => {})
  localVue.directive('tooltip', () => {})
  localVue.use(Vuex)

  Element.prototype.scrollBy = jest.fn()
  scrollBy = jest.spyOn(Element.prototype, 'scrollBy').mockImplementation(() => {})

  store = createTestStore()
  store.commit('workview/SET_DATASET', sfh)
  store.commit('user/SET_PROFILE', joe)
  store.commit('team/SET_CURRENT_TEAM', v7)
  joeMembership = buildMembershipPayload({ id: 1, user_id: joe.id, team_id: 7 })
  joeMembership.role = 'annotator'
  store.commit('team/SET_MEMBERSHIPS', [joeMembership])

  localVue.use(Abilities, store)

  mocks = {
    $theme: createMockTheme(),
    $can: (): boolean => true,
    $route: { query: { } }
  }
  stubs = { BottomBar }
})

afterEach(() => {
  scrollBy.mockReset()
  delete (Element.prototype as any).scrollTo
})

const itMatchesSnapshot = () => {
  it('matches snapshot', async () => {
    store.commit('workview/PUSH_DATASET_ITEMS', itemCollection.slice(0, 2))

    store.commit(
      'workview/PUSH_DATASET_ITEM_CURSOR_MAPPING',
      { previous: 'previous', next: 'next', ids: itemCollection.map((item) => item.id) }
    )

    const wrapper = shallowMount(WorkflowBottomBar, { localVue, mocks, store, stubs })
    expect(wrapper).toMatchSnapshot('all loaded')

    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot('loading queued up')
  })
}

const itRendersItems = () => {
  it('renders items', async () => {
    store.commit('workview/PUSH_DATASET_ITEMS', itemCollection.slice(0, 2))
    const wrapper = shallowMount(WorkflowBottomBar, { localVue, mocks, store, stubs })

    expect(wrapper.findAll('workflow-image-stub').length).toEqual(2)

    store.commit('workview/PUSH_DATASET_ITEMS', itemCollection.slice(2, 4))
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('workflow-image-stub').length).toEqual(4)
  })
}

const itDoesRenderNewBatchItem = () => {
  it('does not render new batch button', () => {
    const wrapper = shallowMount(WorkflowBottomBar, { localVue, mocks, store, stubs })
    expect(wrapper.find('more-work-stub').exists()).toBe(true)
  })
}

const itDoesNotRenderNewBatchItem = () => {
  it('does not render new batch button', () => {
    const wrapper = shallowMount(WorkflowBottomBar, { localVue, mocks, store, stubs })
    expect(wrapper.find('more-work-stub').exists()).toBe(false)
  })
}

describe('when annotator', () => {
  beforeEach(() => {
    mocks.$can = (ability) => ability === 'request_work'
  })

  itMatchesSnapshot()
  itRendersItems()
  itDoesRenderNewBatchItem()
})

describe('when full team member', () => {
  beforeEach(() => {
    joeMembership.role = 'member'
    store.commit('team/SET_MEMBERSHIPS', [joeMembership])
  })

  itMatchesSnapshot()
  itRendersItems()
  itDoesNotRenderNewBatchItem()
})

describe('when workforce manager', () => {
  beforeEach(() => {
    joeMembership.role = 'workforce_manager'
    store.commit('team/SET_MEMBERSHIPS', [joeMembership])
  })

  itMatchesSnapshot()
  itRendersItems()
  itDoesNotRenderNewBatchItem()
})

describe('when unauthenticated', () => {
  beforeEach(() => {
    store.commit('user/SET_PROFILE', null)
    store.commit('team/SET_CURRENT_TEAM', null)
    store.commit('team/SET_MEMBERSHIPS', [])
  })

  itMatchesSnapshot()
  itRendersItems()
  itDoesNotRenderNewBatchItem()
})

it('dispatches load to store on bottom-bar page-changed', async () => {
  const stubs = {}
  store.commit('workview/PUSH_DATASET_ITEMS', itemCollection)
  store.commit(
    'workview/PUSH_DATASET_ITEM_CURSOR_MAPPING',
    { previous: 'previous', next: 'next', ids: itemCollection.map((item) => item.id) }
  )
  const wrapper = shallowMount(WorkflowBottomBar, { localVue, mocks, store, stubs })

  wrapper.find('bottom-bar-stub').vm.$emit('page-changed', 450, 470)
  await wrapper.vm.$nextTick()

  expect(store.state.workview.datasetItemPageRegistry).toEqual({
    queue: [
      { size: 50, to: 'previous' },
      { from: 'next', size: 50 }
    ],
    requested: []
  })
})

describe('preloading', () => {
  const buildImageItem = (id: number, seq: number, url: string) =>
    buildDatasetItemPayload({
      id,
      seq,
      dataset_image: buildDatasetImagePayload({
        id: id * 10,
        seq,
        image: buildImagePayload({ id: id * 1000, url })
      })
    })

  const items = [
    buildImageItem(11, 1, '11.png'),
    buildImageItem(22, 2, '22.png'),
    buildImageItem(33, 3, '33.png'),
    buildImageItem(44, 4, '44.png'),
    buildImageItem(55, 5, '55.png'),
    buildImageItem(66, 6, '66.png')
  ]

  beforeEach(() => {
    joeMembership.role = 'member'
    store.commit('team/SET_MEMBERSHIPS', [joeMembership])
    // items are out of order in store, but they ought to get sorted in bottom bar
    store.commit('workview/PUSH_DATASET_ITEMS', items)
  })

  it('assigns correct images to preload when on first item', async () => {
    const wrapper = shallowMount(WorkflowBottomBar, { localVue, mocks, store, stubs })

    // no item selected, so []
    expect(wrapper.find('preload-image-stub').props('images')).toEqual([])

    store.commit('workview/SET_SELECTED_DATASET_ITEM', items[0])
    await wrapper.vm.$nextTick()

    // item selected, but not loaded, so []
    expect(wrapper.find('preload-image-stub').props('images')).toEqual([])

    // item loaded
    store.commit('workview/PUSH_LOADED_IMAGE', {
      payload: items[0].dataset_image!,
      image: items[0].dataset_image!.image
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('preload-image-stub').props('images'))
      .toEqual([
        items[1].dataset_image,
        items[2].dataset_image,
        items[3].dataset_image
      ])
  })

  it('assigns correct images to preload when in the middle of the list', async () => {
    const wrapper = shallowMount(WorkflowBottomBar, { localVue, mocks, store, stubs })

    // no item selected, so []
    expect(wrapper.find('preload-image-stub').props('images')).toEqual([])

    store.commit('workview/SET_SELECTED_DATASET_ITEM', items[3])
    await wrapper.vm.$nextTick()

    // item selected, but not loaded, so []
    expect(wrapper.find('preload-image-stub').props('images')).toEqual([])

    // item loaded
    store.commit('workview/PUSH_LOADED_IMAGE', {
      payload: items[3].dataset_image!,
      image: items[3].dataset_image!.image
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('preload-image-stub')
      .props('images'))
      .toEqual([
        items[4].dataset_image,
        items[2].dataset_image,
        items[5].dataset_image,
        items[1].dataset_image,
        items[0].dataset_image
      ])
  })

  it('assigns correct images to preload when on last item', async () => {
    const wrapper = shallowMount(WorkflowBottomBar, { localVue, mocks, store, stubs })

    // no item selected, so []
    expect(wrapper.find('preload-image-stub').props('images')).toEqual([])

    store.commit('workview/SET_SELECTED_DATASET_ITEM', items[5])
    await wrapper.vm.$nextTick()

    // item selected, but not loaded, so []
    expect(wrapper.find('preload-image-stub').props('images')).toEqual([])

    // item loaded
    store.commit('workview/PUSH_LOADED_IMAGE', {
      payload: items[5].dataset_image!,
      image: items[5].dataset_image!.image
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('preload-image-stub')
      .props('images'))
      .toEqual([
        items[4].dataset_image,
        items[3].dataset_image,
        items[2].dataset_image
      ])
  })
})
