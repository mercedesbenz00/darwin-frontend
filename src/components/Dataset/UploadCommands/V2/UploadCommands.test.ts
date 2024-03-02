import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload, buildTeamPayload } from 'test/unit/factories'

import UploadCommands from '@/components/Dataset/UploadCommands/UploadCommands.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 1, slug: 'v7' }))
})

it('matches snapshot', () => {
  const propsData = { dataset: buildDatasetPayload({ id: 1 }) }
  const wrapper = shallowMount(UploadCommands, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
