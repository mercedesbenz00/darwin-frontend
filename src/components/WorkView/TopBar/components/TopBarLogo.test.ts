import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore, { giveFullMemberAbility, giveAnnotatorAbiliy } from 'test/unit/createTestStore'
import { buildTeamPayload, buildDatasetPayload } from 'test/unit/factories'

import TopBarLogo from '@/components/WorkView/TopBar/components/TopBarLogo.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', () => {})

let store: ReturnType<typeof createTestStore>
const stubs: Stubs = { 'router-link': true }
let mocks: {
  $router: { go: () => void }
  $route: { path: string, query: Object }
  $theme: ReturnType<typeof createMockTheme>
}
let propsData: { disabled?: boolean }

const sfh = buildDatasetPayload({ id: 1, slug: 'SFH', team_slug: 'V7' })

const openDatasetWorkviewRoute: (typeof mocks)['$route'] = { path: '/V7/SFH/1', query: {} }
const workviewRoute: (typeof mocks)['$route'] = { path: '/workview', query: {} }

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_DATASET', sfh)
  giveFullMemberAbility(store)

  mocks = {
    $route: workviewRoute,
    $router: { go: () => {} },
    $theme: createMockTheme()
  }
  propsData = {}
})

const v7 = buildTeamPayload({
  name: 'V7', image: { id: 1, thumbnail_url: 'v7_thumb.png', url: 'v7.png' }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(TopBarLogo, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with team logo available', () => {
  store.commit('team/SET_CURRENT_TEAM', v7)
  const wrapper = shallowMount(TopBarLogo, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot on workview', () => {
  mocks.$route = workviewRoute
  const wrapper = shallowMount(TopBarLogo, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot on open datasets', () => {
  mocks.$route = openDatasetWorkviewRoute
  const wrapper = shallowMount(TopBarLogo, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when annotator', () => {
  giveAnnotatorAbiliy(store)
  const wrapper = shallowMount(TopBarLogo, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot in tutorial', () => {
  store.commit('workview/SET_TUTORIAL_MODE', true)
  const wrapper = shallowMount(TopBarLogo, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
