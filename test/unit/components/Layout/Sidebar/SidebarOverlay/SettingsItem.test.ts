import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload, buildUserPayload } from 'test/unit/factories'

import SettingsItem from '@/components/Layout/Sidebar/SidebarOverlay/SettingsItem.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const v7 = buildTeamPayload({
  id: 1,
  name: 'V7',
  image: { id: 1, url: 'foo', thumbnail_url: 'bar' }
})

const user = buildUserPayload({ id: 1 })

let store: ReturnType<typeof createTestStore>
let mocks: {
  $can: () => boolean,
  $route: { path: string },
  $router: {
    push: Function,
    resolve: Function,
    replace: Function
  }
}
const stubs = ['router-link']

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_TEAMS', [v7])
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('user/SET_PROFILE', user)

  mocks = {
    $can: () => true,
    $route: { path: '' },
    $router: {
      push: jest.fn(),
      replace: jest.fn(),
      resolve: jest.fn().mockReturnValue({ route: { fullPath: '/datasets?settings=plans' } })
    }
  }
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(SettingsItem, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

const itRendersLabel = (label: string) => it(`renders label "${label}"`, () => {
  const wrapper = shallowMount(SettingsItem, { localVue, mocks, store, stubs })
  expect(wrapper.text()).toEqual(label)
})

const itRendersPathTo = (tab: string) => it(`renders path to "${tab}" tab in settings`, () => {
  shallowMount(SettingsItem, { localVue, mocks, store, stubs })
  expect(mocks.$router.resolve).toHaveBeenCalledWith(
    expect.objectContaining({ query: { settings: tab } })
  )
})

describe('as someone who can manage billing', () => {
  beforeEach(() => { mocks.$can = () => true })
  itMatchesSnapshot()
  itRendersLabel('Settings & Billing')
  itRendersPathTo('plans')
})

describe('as someone who cannot manage billing', () => {
  beforeEach(() => { mocks.$can = () => false })
  itMatchesSnapshot()
  itRendersLabel('Settings')
  itRendersPathTo('profile')
})
