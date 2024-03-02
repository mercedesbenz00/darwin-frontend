import { shallowMount, createLocalVue, Stubs, Wrapper } from '@vue/test-utils'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildUserPayload, buildImagePayload, buildTeamPayload } from 'test/unit/factories'
import { SettingsPane } from 'test/unit/stubs'

import Profile from '@/layouts/Main/SettingsDialog/Panes/Profile.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueJSModal)
installCommonComponents(localVue)

const joeNoImage = buildUserPayload({
  id: 1, first_name: 'Joe', last_name: 'Smith', image: null
})

const joeImage = buildUserPayload({
  id: 2, first_name: 'Joe', last_name: 'Smith', image: buildImagePayload({ id: 2 })
})

const v7Enforced2fa = buildTeamPayload({ id: 1, two_factor_auth_enforced: true })
const v7NotEnforced2fa = buildTeamPayload({ id: 1, two_factor_auth_enforced: false })

let store: ReturnType<typeof createTestStore>
const stubs: Stubs = {
  'input-field': true,
  SettingsPane
}

beforeEach(() => { store = createTestStore() })

describe('when 2fa is not enforced', () => {
  beforeEach(() => {
    store.commit('user/SET_PROFILE', joeNoImage)
    store.commit('team/SET_CURRENT_TEAM', v7NotEnforced2fa)
  })

  it('matches snapshot with profile unloaded', () => {
    const wrapper = shallowMount(Profile, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot with imageless profile', () => {
    const wrapper = shallowMount(Profile, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot with profile with image', () => {
    store.commit('user/SET_PROFILE', joeImage)
    const wrapper = shallowMount(Profile, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('submit with right avatar data while saving updated data', async () => {
    store.commit('user/SET_PROFILE', joeImage)
    const wrapper = shallowMount(Profile, { localVue, store, stubs })
    const avatarData = { hash: 'hash', file: new File([], 'file.png'), type: 'image/png' }
    wrapper.find('avatar-upload-stub').vm.$emit('change', avatarData)
    await wrapper.find('form').trigger('submit')
    expect(store.dispatch).toBeCalledWith('user/updateProfile', {
      first_name: joeImage.first_name,
      last_name: joeImage.last_name,
      hash: avatarData.hash,
      content: avatarData.file,
      type: avatarData.type,
      two_factor_auth_enabled: false
    })
  })

  it('disable avatar upload while uploading', async () => {
    store.commit('user/SET_PROFILE', joeImage)
    const wrapper = shallowMount(Profile, { localVue, store, stubs })
    const avatarData = { hash: 'hash', file: new File([], 'file.png'), type: 'image/png' }
    wrapper.find('avatar-upload-stub').vm.$emit('change', avatarData)
    await wrapper.find('form').trigger('submit')
    expect(wrapper).toMatchSnapshot()
  })

  describe('when 2fa is enabled', () => {
    let wrapper: Wrapper<Vue>

    beforeEach(async () => {
      wrapper = shallowMount(Profile, { localVue, store, stubs })
      await wrapper.find('check-box-stub[name="enableTwoFactorAuthentication"]').vm.$emit('input', true)
    })

    it('matches snapshot', () => {
      expect(wrapper).toMatchSnapshot()
    })

    it('opens 2fa confirmation modal on configure', async () => {
      jest.spyOn(wrapper.vm.$modal, 'show').mockReturnValue(undefined)
      await wrapper.find('secondary-button-stub.configure_tfa').vm.$emit('click')
      expect(wrapper.vm.$modal.show).toBeCalledWith('setup-tfa-modal')
    })

    it('opens 2fa confirmation modal before submit', async () => {
      jest.spyOn(wrapper.vm.$modal, 'show').mockReturnValue(undefined)
      await wrapper.find('form').trigger('submit')
      expect(wrapper.vm.$modal.show).toBeCalledWith('setup-tfa-modal')
      expect(store.dispatch).not.toBeCalledWith('user/updateProfile')
    })

    it('submits the profile updates after 2fa is confirmed', async () => {
      jest.spyOn(wrapper.vm.$modal, 'show').mockReturnValue(undefined)
      await wrapper.find('form').trigger('submit')
      expect(wrapper.vm.$modal.show).toBeCalledWith('setup-tfa-modal')
      await wrapper.find('setup-tfa-modal-stub').vm.$emit('confirmed')
      expect(store.dispatch).toBeCalledWith('user/updateProfile', {
        first_name: joeImage.first_name,
        last_name: joeImage.last_name,
        two_factor_auth_enabled: true
      })
    })
  })
})

describe('when 2fa is enforced', () => {
  beforeEach(() => {
    store.commit('user/SET_PROFILE', joeNoImage)
    store.commit('team/SET_CURRENT_TEAM', v7Enforced2fa)
  })

  it('matches snapshot with profile unloaded', () => {
    const wrapper = shallowMount(Profile, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('opens 2fa confirmation modal on configure', async () => {
    const wrapper = shallowMount(Profile, { localVue, store, stubs })
    jest.spyOn(wrapper.vm.$modal, 'show').mockReturnValue(undefined)
    await wrapper.find('secondary-button-stub.configure_tfa').vm.$emit('click')
    expect(wrapper.vm.$modal.show).toBeCalledWith('setup-tfa-modal')
  })

  it('opens 2fa confirmation modal before submit', async () => {
    const wrapper = shallowMount(Profile, { localVue, store, stubs })
    jest.spyOn(wrapper.vm.$modal, 'show').mockReturnValue(undefined)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.vm.$modal.show).toBeCalledWith('setup-tfa-modal')
    expect(store.dispatch).not.toBeCalledWith('user/updateProfile')
  })

  it('submits the profile updates after 2fa is confirmed', async () => {
    const wrapper = shallowMount(Profile, { localVue, store, stubs })
    jest.spyOn(wrapper.vm.$modal, 'show').mockReturnValue(undefined)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.vm.$modal.show).toBeCalledWith('setup-tfa-modal')
    await wrapper.find('setup-tfa-modal-stub').vm.$emit('confirmed')
    expect(store.dispatch).toBeCalledWith('user/updateProfile', {
      first_name: joeImage.first_name,
      last_name: joeImage.last_name,
      two_factor_auth_enabled: true
    })
  })
})
