import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildTeamPayload } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'
import { emitRootStub } from 'test/unit/testHelpers'

import SsoConfigModal from '@/components/Layout/SettingsDialog/SsoConfigModal.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.directive('loading', stubDirectiveWithAttribute)
installCommonComponents(localVue)

const v7Team = buildTeamPayload({
  id: 1,
  name: 'V7',
  enforcing_sso_allowed: true,
  inserted_at: '2000-01-01T00:00:00'
})

let store: ReturnType<typeof createTestStore>
let mocks: {
  $can: Function,
  $modal: {
    show: jest.Mock,
    hide: jest.Mock
  }
}

mockApi()

beforeEach(() => {
  store = createTestStore()
  mocks = {
    $can: jest.fn().mockReturnValue(true),
    $modal: {
      show: jest.fn(),
      hide: jest.fn()
    }
  }
  store.commit('team/SET_CURRENT_TEAM', v7Team)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(SsoConfigModal, { localVue, store, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('should request config before open modal', async () => {
  const wrapper = shallowMount(SsoConfigModal, { localVue, store, mocks })
  await emitRootStub(wrapper, 'before-open')
  expect(store.dispatch).toHaveBeenCalledWith('sso/loadConfig')
})

it('should display existing config', async () => {
  jest.spyOn(store, 'dispatch').mockResolvedValue({ data: { idp_metadata: 'config data' } })

  const wrapper = shallowMount(SsoConfigModal, { localVue, store, mocks })
  await emitRootStub(wrapper, 'before-open')
  await flushPromises()
  expect(wrapper.find('text-area-stub').attributes('value')).toBe('config data')
})

it('onSubmit should save config', async () => {
  const spy = jest.spyOn(store, 'dispatch')

  const wrapper = shallowMount(SsoConfigModal, { localVue, store, mocks })
  wrapper.vm.$data.ssoConfig = 'new config data'

  await (wrapper.vm as any).onSubmit()
  expect(spy).toHaveBeenCalledWith('sso/saveConfig', 'new config data')
})
