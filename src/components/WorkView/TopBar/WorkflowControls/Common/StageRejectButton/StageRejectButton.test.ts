import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildUserPayload, buildWorkflowStagePayload } from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import { WorkflowStagePayload } from '@/store/types'

import StageRejectButton from './StageRejectButton.vue'

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
  const wrapper = shallowMount(StageRejectButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot whem not in icon mode', () => {
  const wrapper = shallowMount(StageRejectButton, { localVue, propsData, store })
  const customButton = wrapper.find('custom-button-stub')
  const iconButton = wrapper.find('icon-button-stub')
  expect(customButton.exists()).toBe(false)
  expect(iconButton.exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when not in icon mode', async () => {
  const wrapper = shallowMount(StageRejectButton, { localVue, propsData, store })
  await wrapper.setProps({ icon: false })
  const customButton = wrapper.find('custom-button-stub')
  const iconButton = wrapper.find('icon-button-stub')
  expect(customButton.exists()).toBe(true)
  expect(iconButton.exists()).toBe(false)
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when in autocomplete skipped', () => {
  const modifiedInstance = {
    ...instance,
    metadata: { review_status: 'rejected' },
    completes_at: 50
  }
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', modifiedInstance)
  const wrapper = shallowMount(StageRejectButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('dispatches to workview when rejecting', async () => {
  const wrapper = shallowMount(StageRejectButton, { localVue, propsData, store })
  await emitRootStub(wrapper, 'click')
  expect(store.dispatch)
    .toHaveBeenLastCalledWith('workview/rejectStage', instance)
})

it('self-assigns if stage not assigned', async () => {
  const stage = { ...instance, assignee_id: null }
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('user/SET_PROFILE', buildUserPayload({ id: 5 }))
  const wrapper = shallowMount(StageRejectButton, { localVue, propsData, store })
  await emitRootStub(wrapper, 'click')
  expect(store.dispatch)
    .toHaveBeenCalledWith('workview/assignStage', { stage, userId: 5 })
})

it('dispatches to workview when unrejecting', async () => {
  const modifiedInstance = {
    ...instance,
    metadata: { review_status: 'rejected' },
    completes_at: 50
  }
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', modifiedInstance)
  const wrapper = shallowMount(StageRejectButton, { localVue, propsData, store })
  await emitRootStub(wrapper, 'click')
  expect(store.dispatch)
    .toHaveBeenLastCalledWith('workview/resetStageReviewStatus', modifiedInstance)
})
