import { createLocalVue, shallowMount, Stubs, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { DatasetDetailLayout, PickDatasetModal } from 'test/unit/stubs'

import loadingDirective from '@/directives/loading'
import { installCommonComponents } from '@/plugins/components'
import { LoadingStatus } from '@/store/types'
import TeamClasses from '@/views/classes/TeamClasses.vue'

const localVue = createLocalVue()
localVue.directive('loading', loadingDirective)
localVue.use(Vuex)
installCommonComponents(localVue)

const myTeam = buildTeamPayload({
  id: 1,
  slug: 'my-team',
  name: 'My Team',
  disabled: false,
  disable_dataset_sharing: false,
  neural_models_enabled: false,
  image: {
    id: -1,
    url: '',
    thumbnail_url: ''
  },
  members: [],
  inserted_at: '2000-01-01',
  enforcing_two_factor_auth_allowed: false,
  two_factor_auth_enforced: false
})

const classes = [
  buildAnnotationClassPayload({
    id: 1,
    team_id: myTeam.id,
    annotation_types: ['polygon']
  }),
  buildAnnotationClassPayload({
    id: 2,
    team_id: myTeam.id,
    annotation_types: ['polygon']
  }),
  buildAnnotationClassPayload({
    id: 3,
    team_id: myTeam.id,
    annotation_types: ['bounding_box']
  }),
  buildAnnotationClassPayload({
    id: 4,
    team_id: myTeam.id,
    annotation_types: ['cuboid']
  })
]

const mocks = {
  $modal: {
    show: jest.fn(),
    hide: jest.fn()
  },
  $route: {},
  $theme: createMockTheme()
}

const stubs: Stubs = {
  DatasetDetailLayout,
  PickDatasetModal
}

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()

  store.commit('aclass/SET_CLASSES_LOADING_STATUS', LoadingStatus.Loaded)
  store.commit('aclass/SET_CLASSES', classes)
  store.commit('team/SET_CURRENT_TEAM', myTeam)
})

it('matches snapshot when loaded', () => {
  store.commit('aclass/SET_CLASSES_LOADING_STATUS', LoadingStatus.Loaded)
  const wrapper = shallowMount(TeamClasses, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when loading', () => {
  store.commit('aclass/SET_CLASSES_LOADING_STATUS', LoadingStatus.Loading)
  const wrapper = shallowMount(TeamClasses, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get classes () {
    const wrapper = this.wrapper.find('classes-gallery-stub')
    return {
      count: wrapper.props('classes').length,
      wrapper
    }
  }
}

it('applies type filter to class list', async () => {
  const wrapper = shallowMount(TeamClasses, { localVue, mocks, store, stubs })
  const model = new Model(wrapper)

  expect(model.classes.count).toEqual(4)

  store.commit('aclass/SET_CLASSES_TAB_SELECTED_TYPE_NAMES', ['polygon'])
  await wrapper.vm.$nextTick()
  expect(model.classes.count).toEqual(2)

  store.commit('aclass/SET_CLASSES_TAB_SELECTED_TYPE_NAMES', ['polygon', 'cuboid'])
  await wrapper.vm.$nextTick()
  expect(model.classes.count).toEqual(3)
})
