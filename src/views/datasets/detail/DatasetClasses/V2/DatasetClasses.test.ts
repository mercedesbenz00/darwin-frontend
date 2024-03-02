import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { DatasetDetailLayout, PickDatasetModal } from 'test/unit/stubs'

import loadingDirective from '@/directives/loading'
import { installCommonComponents } from '@/plugins/components'
import { DatasetPayload, LoadingStatus } from '@/store/types'
import DatasetClasses from '@/views/datasets/detail/DatasetClasses/V2/DatasetClasses.vue'

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
  buildAnnotationClassPayload({ id: 1, team_id: myTeam.id, datasets: [{ id: 7 }] }),
  buildAnnotationClassPayload({ id: 2, team_id: myTeam.id }),
  buildAnnotationClassPayload({ id: 3, team_id: myTeam.id })
]
const dataset = buildDatasetPayload({ id: 7 })

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
  PickDatasetModal,
  'router-link': true
}

let store: ReturnType<typeof createTestStore>
let propsData: { dataset: DatasetPayload }

beforeEach(() => {
  store = createTestStore()

  store.commit('aclass/SET_CLASSES', classes)
  store.commit('aclass/SET_CLASSES_LOADING_STATUS', LoadingStatus.Loaded)
  store.commit('team/SET_CURRENT_TEAM', myTeam)
  propsData = { dataset }
})

it('matches snapshot when loading', () => {
  store.commit('aclass/SET_CLASSES_LOADING_STATUS', LoadingStatus.Loading)
  const wrapper = shallowMount(DatasetClasses, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot', () => {
  store.commit('aclass/SET_CLASSES_LOADING_STATUS', LoadingStatus.Loaded)
  const wrapper = shallowMount(DatasetClasses, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
