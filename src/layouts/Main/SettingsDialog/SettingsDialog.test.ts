import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Router from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload, buildUserPayload } from 'test/unit/factories'

import SettingsDialog from '@/layouts/Main/SettingsDialog/SettingsDialog.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)
localVue.use(Router)

let store: ReturnType<typeof createTestStore>

const v7 = buildTeamPayload({ id: 7 })
const johnDoe = buildUserPayload({ id: 5, first_name: 'John', last_name: 'Doe' })

const router = new Router()

let mocks: {
  $can: jest.Mock<boolean>
}
beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('user/SET_PROFILE', johnDoe)
  mocks = {
    $can: jest.fn().mockReturnValue(true)
  }
})

const itMatchesSnapshot = (): void => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(SettingsDialog, { localVue, router, store, mocks })
    expect(wrapper).toMatchSnapshot()
  })
}

const annotatorAbilities: Record<string, boolean> = {
  view_team_members: false,
  view_customer: false,
  create_api_key: false
}

const memberAbilities: Record<string, boolean> = {
  view_team_members: true,
  view_customer: true,
  create_api_key: true
}

const workforceManagerAbilities: Record<string, boolean> = {
  view_team_members: true,
  view_customer: true,
  create_api_key: false
}

describe('when annotator', () => {
  beforeEach(() => {
    mocks.$can = jest.fn()
      .mockImplementation((ability: string) => annotatorAbilities[ability])
  })

  itMatchesSnapshot()
})

describe('when member', () => {
  beforeEach(() => {
    mocks.$can = jest.fn()
      .mockImplementation((ability: string) => memberAbilities[ability])
  })

  itMatchesSnapshot()
})

describe('when workforce manager', () => {
  beforeEach(() => {
    mocks.$can = jest.fn()
      .mockImplementation((ability: string) => workforceManagerAbilities[ability])
  })

  itMatchesSnapshot()
})

describe('when admin', () => {
  beforeEach(() => {
    mocks.$can = jest.fn()
      .mockImplementation((ability: string) => memberAbilities[ability])
  })

  itMatchesSnapshot()
})

describe('when owner', () => {
  beforeEach(() => {
    mocks.$can = jest.fn()
      .mockImplementation((ability: string) => memberAbilities[ability])
  })

  itMatchesSnapshot()
})

it('logs out on logout click', async () => {
  const wrapper = shallowMount(SettingsDialog, { localVue, router, store, mocks })
  await wrapper
    .findAll('settings-tab-stub').wrappers
    .find(t => t.attributes('title') === 'Log Out')!
    .vm.$emit('click')
  expect(store.dispatch).toHaveBeenCalledWith('auth/logout')
})

describe('on show', () => {
  it('loads profile', async () => {
    const wrapper = shallowMount(SettingsDialog, { localVue, router, store, mocks })

    expect(store.dispatch).not.toHaveBeenCalledWith('user/loadProfile')
    store.commit('ui/SET_SHOW_SETTINGS', 'true')
    await wrapper.vm.$nextTick()
    expect(store.dispatch).toHaveBeenCalledWith('user/loadProfile')
  })
})
