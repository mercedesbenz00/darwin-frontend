import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildUserPayload } from 'test/unit/factories'
import { triggerRootStub } from 'test/unit/testHelpers'

import { AvatarUploadData } from '@/components/Common/AvatarUpload/types'
import RegisterTeamForm from '@/components/Teams/RegisterTeamForm.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
const mocks = {
  $ga: { event: jest.fn() },
  $route: { query: { token: 'Token' } }
}
const stubs: Stubs = { 'input-field': true }

beforeEach(() => {
  store = createTestStore()
  store.commit('user/SET_PROFILE', buildUserPayload({
    id: 1,
    email: 'test@v7labs.com'
  }))
})

const models = {
  name: '.register-team__name input-field-stub',
  avatarUpload: 'avatar-upload-stub'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(RegisterTeamForm, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('registers a new team', async () => {
  store.dispatch = jest.fn().mockImplementation((action: string) => {
    if (action === 'team/register') {
      return { data: { id: 1 } }
    }
    return {}
  })

  const wrapper = shallowMount(RegisterTeamForm, { localVue, mocks, store, stubs })
  wrapper.find(models.name).vm.$emit('input', 'V7')
  await triggerRootStub(wrapper, 'submit')
  expect(store.dispatch).toBeCalledWith('team/register', {
    name: 'V7',
    hash: null,
    content: null,
    type: null
  })
  expect(store.dispatch).toBeCalledWith('auth/selectTeam', { team_id: 1 })
  expect(store.dispatch).toBeCalledWith('team/getMemberships')
  await flushPromises()
  expect(mocks.$ga.event).toBeCalledWith('create_team', 'submit', 'success')
  expect(wrapper.emitted().submitted).toBeDefined()
})

it('registers a new user with avatar', async () => {
  store.dispatch = jest.fn().mockImplementation((action: string) => {
    if (action === 'team/register') {
      return { data: { id: 1 } }
    }
    return {}
  })

  const wrapper = shallowMount(RegisterTeamForm, { localVue, mocks, store, stubs })
  wrapper.find(models.name).vm.$emit('input', 'V7')
  const avatarData: AvatarUploadData = {
    hash: 'hash',
    file: new File([''], 'foo.png', { type: 'image/jpg' }),
    type: 'image/jpg'
  }
  wrapper.find(models.avatarUpload).vm.$emit('change', avatarData)
  await triggerRootStub(wrapper, 'submit')
  expect(store.dispatch).toBeCalledWith('team/register', {
    name: 'V7',
    hash: avatarData.hash,
    content: avatarData.file,
    type: avatarData.type
  })
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('auth/selectTeam', { team_id: 1 })
  expect(store.dispatch).toBeCalledWith('team/getMemberships')
  expect(mocks.$ga.event).toBeCalledWith('create_team', 'submit', 'success')
  expect(wrapper.emitted().submitted).toBeDefined()
})

it('shows proper validation error messages when failed during registration', async () => {
  store.dispatch = jest.fn().mockImplementation((action: string) => {
    if (action === 'team/register') {
      return {
        error: {
          code: 'registration_failed',
          isValidationError: true,
          name: 'name-error'
        }
      }
    }
    return {}
  })
  const wrapper = shallowMount(RegisterTeamForm, { localVue, mocks, store, stubs })
  wrapper.find(models.name).vm.$emit('input', 'V7')
  await triggerRootStub(wrapper, 'submit')
  expect(store.dispatch).toBeCalledWith('team/register', {
    name: 'V7',
    hash: null,
    content: null,
    type: null
  })
  await flushPromises()
  expect(wrapper.find(models.name).props('error')).toEqual('name-error')
  expect(mocks.$ga.event).toBeCalledWith('create_team', 'submit', 'failure_not_authorized')
  expect(wrapper.emitted().submitted).not.toBeDefined()
})
