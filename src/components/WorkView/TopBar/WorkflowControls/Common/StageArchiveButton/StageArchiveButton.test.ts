import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildUserPayload, buildWorkflowStagePayload } from 'test/unit/factories'

import { WorkflowStagePayload } from '@/store/types'

import StageArchiveButton from './StageArchiveButton.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', () => stubDirectiveWithAttribute)
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let instance: WorkflowStagePayload
const propsData = { icon: true }
beforeEach(() => {
  store = createTestStore()
  instance = buildWorkflowStagePayload({ id: 1, assignee_id: 2 })
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', instance)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(StageArchiveButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when in autocomplete', () => {
  const modifiedInstance = {
    ...instance,
    metadata: { review_status: 'archived' },
    completes_at: 50
  }
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', modifiedInstance)
  const wrapper = shallowMount(StageArchiveButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot whem not in icon mode', () => {
  const wrapper = shallowMount(StageArchiveButton, { localVue, store })
  const customButton = wrapper.find('custom-button-stub')
  const iconButton = wrapper.find('icon-button-stub')
  expect(customButton.exists()).toBe(false)
  expect(iconButton.exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when not in icon mode', async () => {
  const wrapper = shallowMount(StageArchiveButton, { localVue, store })
  await wrapper.setProps({ icon: false })
  const customButton = wrapper.find('custom-button-stub')
  const iconButton = wrapper.find('icon-button-stub')
  expect(customButton.exists()).toBe(true)
  expect(iconButton.exists()).toBe(false)
  expect(wrapper).toMatchSnapshot()
})

it('dispatches to workview when archiving', () => {
  const wrapper = shallowMount(StageArchiveButton, { localVue, store })
  const button = wrapper.find('.archive-button')
  button.vm.$emit('click')
  expect(store.dispatch)
    .toHaveBeenLastCalledWith('workview/archiveStage', instance)
})

it('self-assigns if stage not assigned', () => {
  const stage = { ...instance, assignee_id: null }
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('user/SET_PROFILE', buildUserPayload({ id: 5 }))
  const wrapper = shallowMount(StageArchiveButton, { localVue, propsData, store })
  const button = wrapper.find('.archive-button')
  button.vm.$emit('click')
  expect(store.dispatch)
    .toHaveBeenCalledWith('workview/assignStage', { stage, userId: 5 })
})

it('dispatches to workview when unarchiving', () => {
  const modifiedInstance = {
    ...instance,
    metadata: { review_status: 'archived' },
    completes_at: 50
  }
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', modifiedInstance)
  const wrapper = shallowMount(StageArchiveButton, { localVue, propsData, store })
  const button = wrapper.find('.archive-button')
  button.vm.$emit('click')
  expect(store.dispatch)
    .toHaveBeenLastCalledWith('workview/resetStageReviewStatus', modifiedInstance)
})
