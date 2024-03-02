import { createLocalVue, shallowMount, Stubs, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import SidebarOverlay from '@/components/Layout/Sidebar/SidebarOverlay.vue'
import clickOutsideDirective from '@/directives/click-outside'
import { errorsByCode } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('click-outside', clickOutsideDirective)

let store: ReturnType<typeof createTestStore>
let mocks: {
  $router: {
    push: Function,
    replace: Function
  }
}
const stubs: Stubs = ['router-link']

const v7 = buildTeamPayload({
  id: 1,
  name: 'V7',
  image: { id: 1, url: 'foo', thumbnail_url: 'bar' }
})

const otherTeam = buildTeamPayload({
  id: 2,
  name: 'Other Team',
  image: { id: 2, url: 'foo1', thumbnail_url: 'bar1' }
})

const clientTeam1 = buildTeamPayload({ id: 4, name: 'Client 1', managed_status: 'client' })
const clientTeam2 = buildTeamPayload({ id: 5, name: 'Client 2', managed_status: 'client' })

const partnerTeam = buildTeamPayload({
  id: 3,
  name: 'Partner',
  managed_status: 'partner',
  clients: [clientTeam1, clientTeam2]
})

class TeamItemModel {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  click (): Vue {
    return this.wrapper.vm.$emit('click')
  }

  get key (): string {
    return this.wrapper.vm.$vnode.key!.toString()
  }
}

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get currentTeam (): TeamItemModel {
    return new TeamItemModel(this.wrapper.find('.overlay__team--current'))
  }

  get currentClients (): TeamItemModel[] {
    return this
      .wrapper.findAll('.overlay__team--current-client')
      .wrappers.map(wrapper => new TeamItemModel(wrapper))
  }

  get otherTeams (): TeamItemModel[] {
    return this
      .wrapper.findAll('.overlay__team--other')
      .wrappers.map(wrapper => new TeamItemModel(wrapper))
  }

  get otherClients (): TeamItemModel[] {
    return this
      .wrapper.findAll('.overlay__team--other-client')
      .wrappers.map(wrapper => new TeamItemModel(wrapper))
  }
}

beforeEach(() => {
  store = createTestStore()
  store.commit('auth/SET_AUTHENTICATED', true)
  store.commit('team/SET_TEAMS', [v7, otherTeam, partnerTeam])
  store.commit('team/SET_CURRENT_TEAM', v7)

  mocks = {
    $router: {
      push: jest.fn(),
      replace: jest.fn()
    }
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(SidebarOverlay, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('opens settings dialog when current team is clicked', async () => {
  const wrapper = shallowMount(SidebarOverlay, { localVue, store, stubs, mocks })
  const model = new Model(wrapper)
  await model.currentTeam.click()
  expect(store.dispatch).toBeCalledWith('ui/showSettingsDialog', { tab: 'team' })
})

describe('if other team is clicked', () => {
  it('dispatches store action to select other team', async () => {
    const wrapper = shallowMount(SidebarOverlay, { localVue, store, stubs, mocks })
    const model = new Model(wrapper)
    await model.otherTeams[0].click()
    expect(store.dispatch).toBeCalledWith('auth/selectTeam', { team_id: otherTeam.id })
    await flushPromises()
    expect(mocks.$router.push).toBeCalledWith('/hack')
    expect(mocks.$router.replace).toBeCalledWith('/')
  })

  it('toasts error when other team is disabled', async () => {
    const otherTeam = buildTeamPayload({ id: 2, disabled: true })
    store.commit('team/SET_TEAMS', [v7, otherTeam])

    const wrapper = shallowMount(SidebarOverlay, { localVue, store, stubs, mocks })
    const model = new Model(wrapper)
    await model.otherTeams[0].click()
    expect(store.dispatch).toBeCalledWith('toast/warning', { content: errorsByCode.TEAM_DISABLED })
    await flushPromises()
    expect(mocks.$router.push).not.toBeCalledWith('/hack')
    expect(mocks.$router.replace).not.toBeCalledWith('/')
  })

  it('toasts error if vuex action fails with error', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'foo' } })
    const wrapper = shallowMount(SidebarOverlay, { localVue, store, stubs, mocks })
    const model = new Model(wrapper)
    await model.otherTeams[0].click()
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('toast/warning', { content: 'foo' })
    expect(mocks.$router.push).not.toBeCalledWith('/hack')
    expect(mocks.$router.replace).not.toBeCalledWith('/')
  })
})

it('renders clients on unselected partner team', () => {
  const wrapper = shallowMount(SidebarOverlay, { localVue, store, stubs, mocks })
  const model = new Model(wrapper)
  expect(model.otherClients.length).toEqual(2)
  expect(model.otherClients[0].key.startsWith('client')).toBe(true)
})

it('assigns prefixed key to selected team clients', () => {
  const wrapper = shallowMount(SidebarOverlay, { localVue, store, stubs, mocks })
  const model = new Model(wrapper)
  expect(model.otherClients[0].key.startsWith('client')).toBe(true)
})

it('renders clients on current partner team', () => {
  store.commit('team/SET_CURRENT_TEAM', partnerTeam)
  const wrapper = shallowMount(SidebarOverlay, { localVue, store, stubs, mocks })
  const model = new Model(wrapper)
  expect(model.currentClients.length).toEqual(2)
})

it('assigns prefixed key to unselected team clients', () => {
  store.commit('team/SET_CURRENT_TEAM', partnerTeam)
  const wrapper = shallowMount(SidebarOverlay, { localVue, store, stubs, mocks })
  const model = new Model(wrapper)
  expect(model.currentClients[0].key.startsWith('client')).toBe(true)
})
