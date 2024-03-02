import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildMembershipPayload,
  buildTeamPayload,
  buildUserPayload
} from 'test/unit/factories'

import Sidebar from '@/layouts/Main/Sidebar/Sidebar.vue'
import { FeaturePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const joeRegular = buildUserPayload({ id: 1 })
const joeSuper = buildUserPayload({ id: 1, superuser: true })

let store: ReturnType<typeof createTestStore>

const models = {
  getStartedBtn: '.sidebar__redirect-btn',
  administrationMenuItem: 'administration-menu-item-stub',
  workflowsMenuItem: 'workflows-menu-item-stub',
  datasetsMenuItem: 'datasets-menu-item-stub'
}

const v7 = buildTeamPayload({ id: 1 })
const userMembership = buildMembershipPayload({
  id: 1,
  user_id: 1,
  team_id: v7.id,
  role: 'member',
  email: 'member@example.com',
  first_name: 'Mark',
  last_name: 'Ember'
})

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', [userMembership])
  store.commit('user/SET_PROFILE', joeRegular)
  store.commit('auth/SET_ABILITIES', [{ subject: 'all', actions: ['view_full_datasets'] }])
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Sidebar, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

describe('when unauthorized user for open dataset mode', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    store.commit('user/SET_PROFILE', null)
    wrapper = shallowMount(Sidebar, { localVue, store })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(Sidebar, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('render get started redirect button', () => {
    expect(wrapper.find(models.getStartedBtn).exists()).toBe(true)
  })
})

describe('when regular team member', () => {
  beforeEach(() => {
    store.commit('user/SET_PROFILE', joeRegular)
    store.commit('auth/SET_ABILITIES', [{ subject: 'all', actions: ['view_full_datasets'] }])

  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(Sidebar, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('does not render administration', () => {
    const wrapper = shallowMount(Sidebar, { localVue, store })
    expect(wrapper.find(models.administrationMenuItem).exists()).toBe(false)
  })
})

describe('when superuser', () => {

  beforeEach(() => {
    store.commit('user/SET_PROFILE', joeSuper)
    store.commit('auth/SET_ABILITIES', [{ subject: 'all', actions: ['view_full_datasets'] }])
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(Sidebar, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders administration', () => {
    const wrapper = shallowMount(Sidebar, { localVue, store })
    expect(wrapper.find(models.administrationMenuItem).exists()).toBe(true)
  })
})

describe('when annotator', () => {
  beforeEach(() => {
    store.commit('auth/SET_ABILITIES', [])
  })

  describe('in v1 only team', () => {
    const features: FeaturePayload[] = [
      { name: 'DARWIN_V1_DISABLED', enabled: false },
      { name: 'DARWIN_V2_ENABLED', enabled: false }
    ]

    beforeEach(() => {
      store.commit('features/SET_FEATURES', features)
    })

    it('matches snapshot', () => {
      const wrapper = shallowMount(Sidebar, { localVue, store })
      expect(wrapper).toMatchSnapshot()
    })

    it('renders datasets item', () => {
      const wrapper = shallowMount(Sidebar, { localVue, store })
      expect(wrapper.find(models.datasetsMenuItem).exists()).toBe(true)
    })

    it('does not render workflows item', () => {
      const wrapper = shallowMount(Sidebar, { localVue, store })
      expect(wrapper.find(models.workflowsMenuItem).exists()).toBe(false)
    })
  })

  describe('in v1 + v2 team', () => {
    const features: FeaturePayload[] = [
      { name: 'DARWIN_V1_DISABLED', enabled: false },
      { name: 'DARWIN_V2_ENABLED', enabled: true }
    ]

    beforeEach(() => {
      store.commit('features/SET_FEATURES', features)
      store.commit('user/SET_PROFILE', joeRegular)

    })

    it('matches snapshot', () => {
      const wrapper = shallowMount(Sidebar, { localVue, store })
      expect(wrapper).toMatchSnapshot()
    })

    it('renders datasets item', () => {
      const wrapper = shallowMount(Sidebar, { localVue, store })
      expect(wrapper.find(models.datasetsMenuItem).exists()).toBe(true)
    })

    it('renders workflows item', () => {
      const wrapper = shallowMount(Sidebar, { localVue, store })
      expect(wrapper.find(models.workflowsMenuItem).exists()).toBe(true)
    })
  })

  describe('in v2 only team', () => {
    const features: FeaturePayload[] = [
      { name: 'DARWIN_V1_DISABLED', enabled: true },
      { name: 'DARWIN_V2_ENABLED', enabled: true }
    ]

    beforeEach(() => {
      store.commit('features/SET_FEATURES', features)
    })

    it('matches snapshot', () => {
      const wrapper = shallowMount(Sidebar, { localVue, store })
      expect(wrapper).toMatchSnapshot()
    })

    it('does not render datasets item', () => {
      const wrapper = shallowMount(Sidebar, { localVue, store })
      expect(wrapper.find(models.datasetsMenuItem).exists()).toBe(false)
    })

    it('renders workflows item', () => {
      const wrapper = shallowMount(Sidebar, { localVue, store })
      expect(wrapper.find(models.workflowsMenuItem).exists()).toBe(true)
    })
  })
})
