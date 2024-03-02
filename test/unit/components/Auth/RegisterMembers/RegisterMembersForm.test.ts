import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'
import { triggerRootStub } from 'test/unit/testHelpers'

import RegisterMembersForm from '@/components/Auth/RegisterMembers/RegisterMembersForm.vue'
import { installCommonComponents } from '@/plugins/components'
import { TeamPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
const mocks = {
  $ga: { event: jest.fn() },
  $router: { replace: jest.fn() }
}
const stubs: Stubs = { 'input-field': true }
let v7: TeamPayload

beforeEach(() => {
  store = createTestStore()
  v7 = buildTeamPayload({ id: 1 })
  store.commit('team/SET_CURRENT_TEAM', v7)
})

const models = {
  nthInput: (n: number) => `.register-members__member:nth-child(${n}) input-field-stub`,
  nthRole: (n: number) => `.register-members__member:nth-child(${n}) role-dropdown-stub`,
  nthTrash: (n: number) => `.register-members__member:nth-child(${n}) .register-members__trash`
}

it('matches snapshot', () => {
  const wrapper = shallowMount(RegisterMembersForm, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('add new member field after one is added', async () => {
  const wrapper = shallowMount(RegisterMembersForm, { localVue, mocks, store, stubs })
  await wrapper.find(models.nthInput(1)).vm.$emit('input', 'member1@v7labs.com')
  await wrapper.find(models.nthInput(1)).vm.$emit('change', 'member1@v7labs.com')
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.findAll('.register-members__member')).toHaveLength(2)
})

it('trash removes existing member', async () => {
  const wrapper = shallowMount(RegisterMembersForm, { localVue, mocks, store, stubs })
  await wrapper.find(models.nthInput(1)).vm.$emit('input', 'member1@v7labs.com')
  await wrapper.find(models.nthInput(1)).vm.$emit('change', 'member1@v7labs.com')
  expect(wrapper.findAll('.register-members__member')).toHaveLength(2)
  await wrapper.find(models.nthTrash(1)).trigger('click')
  expect(wrapper.findAll('.register-members__member')).toHaveLength(1)
})

it('when there is no members added, just submit', async () => {
  const wrapper = shallowMount(RegisterMembersForm, { localVue, mocks, store, stubs })
  await triggerRootStub(wrapper, 'submit')
  expect(wrapper.emitted().submitted).toHaveLength(1)
})

it('validation shows proper error for invalid emails', async () => {
  const wrapper = shallowMount(RegisterMembersForm, { localVue, mocks, store, stubs })
  await wrapper.find(models.nthInput(1)).vm.$emit('input', 'member1')
  await wrapper.find(models.nthInput(1)).vm.$emit('change', 'member1')
  await triggerRootStub(wrapper, 'submit')
  expect(wrapper.find(models.nthInput(1)).props('error')).toEqual('Should be a valid email')
  expect(mocks.$ga.event).toBeCalledWith('create_team', 'submit', 'failure_form_invalid')
})

it('send invitations for members added', async () => {
  const wrapper = shallowMount(RegisterMembersForm, { localVue, mocks, store, stubs })
  wrapper.find(models.nthInput(1)).vm.$emit('input', 'member1@v7labs.com')
  wrapper.find(models.nthInput(1)).vm.$emit('change', 'member1@v7labs.com')
  wrapper.find(models.nthRole(1)).vm.$emit('input', 'member')
  await triggerRootStub(wrapper, 'submit')

  expect(store.dispatch).toBeCalledWith('team/addInvitations', {
    teamId: v7.id,
    invitations: [{
      email: 'member1@v7labs.com',
      role: 'member'
    }]
  })
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('team/getMemberships')
  await flushPromises()
  expect(mocks.$ga.event).toBeCalledWith('create_team', 'submit', 'success')
  expect(wrapper.emitted().submitted).toHaveLength(1)
})

it('show toast error when invitation fails', async () => {
  store.dispatch = jest.fn().mockImplementation((action: string) => {
    if (action === 'team/addInvitations') {
      return { error: { message: 'error' } }
    }
    return {}
  })
  const wrapper = shallowMount(RegisterMembersForm, { localVue, mocks, store, stubs })
  wrapper.find(models.nthInput(1)).vm.$emit('input', 'member1@v7labs.com')
  wrapper.find(models.nthInput(1)).vm.$emit('change', 'member1@v7labs.com')
  wrapper.find(models.nthRole(1)).vm.$emit('input', 'member')
  await triggerRootStub(wrapper, 'submit')

  expect(store.dispatch).toBeCalledWith('team/addInvitations', {
    teamId: v7.id,
    invitations: [{
      email: 'member1@v7labs.com',
      role: 'member'
    }]
  })
  expect(mocks.$ga.event).toBeCalledWith('create_team', 'submit', 'failure_not_authorized')
  expect(store.dispatch).toBeCalledWith('toast/warning', { content: 'error' })
  expect(wrapper.emitted().submitted).toBeUndefined()
})
