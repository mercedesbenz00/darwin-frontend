import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import { Modal, Transition } from 'test/unit/stubs'

import PermissionGroupSelector from '@/components/ApiKey/PermissionGroupSelector.vue'
import { PERMISSION_GROUPS, GROUPED_ABILITIES } from '@/components/ApiKey/data'
import auth, { getInitialState as getInitialAuthState } from '@/store/modules/auth'
import { Ability } from '@/store/types'

const localVue = createLocalVue()
localVue.use(VueJSModal)
localVue.use(Vuex)
localVue.directive('tooltip', () => {})

const stubs: Stubs = {
  'check-box': true,
  Modal,
  Transition
}

const actions = Object.values(GROUPED_ABILITIES).reduce((a, b) => a.concat(b))

// TODO: List all abilities here
const abilities: Ability[] = [{ subject: 'all', conditions: {}, actions }]

const newStore = () => {
  const store = new Vuex.Store({
    modules: {
      auth: { ...auth, state: getInitialAuthState() }
    }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

PERMISSION_GROUPS.forEach(group => {
  it(`matches snapshot for ${group.name}`, async () => {
    const propsData = { group }
    const store = newStore()
    store.commit('auth/SET_ABILITIES', abilities)
    const wrapper = shallowMount(PermissionGroupSelector, {
      localVue, propsData, store, stubs
    })
    wrapper.find('.permission-group__header__collapse-expand').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
})

it('toggles all group abilities when toggling group', async () => {
  const group = PERMISSION_GROUPS[0]
  const propsData = { group }
  const store = newStore()
  store.commit('auth/SET_ABILITIES', abilities)
  const wrapper = shallowMount(PermissionGroupSelector, {
    localVue, propsData, store, stubs
  })

  // we are dealing with manual stubs, so we check attributes rather than props

  wrapper.findAll('check-box-stub').at(0).vm.$emit('change', { checked: true })
  await wrapper.vm.$nextTick()
  wrapper
    .findAll('check-box-stub')
    .wrappers.forEach(w => expect(w.attributes('value')).toEqual('true'))
  await wrapper.vm.$nextTick()

  wrapper.findAll('check-box-stub').at(0).vm.$emit('change', { checked: false })
  await wrapper.vm.$nextTick()

  // attributes set to false come out as undefined
  wrapper
    .findAll('check-box-stub')
    .wrappers.forEach(w => expect(w.attributes('value')).toBeUndefined())
})

it('emits on group toggle', async () => {
  const group = PERMISSION_GROUPS.find(g => g.id === 'manage_team_members')
  const propsData = { group }
  const store = newStore()
  const listener = jest.fn()
  store.commit('auth/SET_ABILITIES', abilities)
  const wrapper = shallowMount(PermissionGroupSelector, {
    localVue, propsData, store, stubs, listeners: { change: listener }
  })

  // we are dealing with manual stubs, so we check attributes rather than props

  wrapper.findAll('check-box-stub').at(0).vm.$emit('change', { checked: true })
  await wrapper.vm.$nextTick()
  expect(listener).toHaveBeenCalledWith('manage_team_members', GROUPED_ABILITIES.manage_team_members)
})

it('emits on ability toggle', async () => {
  const group = PERMISSION_GROUPS.find(g => g.id === 'manage_team_members')
  const propsData = { group }
  const store = newStore()
  const listener = jest.fn()
  store.commit('auth/SET_ABILITIES', abilities)
  const wrapper = shallowMount(PermissionGroupSelector, {
    localVue, propsData, store, stubs, listeners: { change: listener }
  })

  wrapper.find('.permission-group__header__collapse-expand').trigger('click')
  await wrapper.vm.$nextTick()

  wrapper.find('check-box-stub[id=view_team_members]').vm.$emit('change', { checked: true })
  await wrapper.vm.$nextTick()
  expect(listener).toHaveBeenCalledWith('manage_team_members', ['view_team_members'])

  wrapper.find('check-box-stub[id=view_invitations]').vm.$emit('change', { checked: true })
  await wrapper.vm.$nextTick()
  expect(listener).toHaveBeenCalledWith('manage_team_members', ['view_team_members', 'view_invitations'])

  wrapper.find('check-box-stub[id=view_team_members]').vm.$emit('change', { checked: false })
  await wrapper.vm.$nextTick()
  expect(listener).toHaveBeenCalledWith('manage_team_members', ['view_invitations'])
})

it('expands and collapses', async () => {
  const group = PERMISSION_GROUPS.find(g => g.id === 'manage_team_members')
  const propsData = { group }
  const store = newStore()
  const listener = jest.fn()
  store.commit('auth/SET_ABILITIES', abilities)
  const wrapper = shallowMount(PermissionGroupSelector, {
    localVue, propsData, store, stubs, listeners: { change: listener }
  })

  wrapper.find('.permission-group__header__collapse-expand').trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$data.expanded).toBe(true)
  expect(wrapper.find('.permission-group--expanded').exists()).toBe(true)

  wrapper.find('.permission-group__header__collapse-expand').trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$data.expanded).toBe(false)
  expect(wrapper.find('.permission-group--expanded').exists()).toBe(false)
})
