import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildUserPayload, buildWorkflowStagePayload } from 'test/unit/factories'

import { WorkflowStagePayload } from '@/store/types'

import StageSkipButton from './StageSkipButton.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', () => stubDirectiveWithAttribute)
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let instance: WorkflowStagePayload
beforeEach(() => {
  store = createTestStore()
  instance = buildWorkflowStagePayload({ id: 1, assignee_id: 2 })
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', instance)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(StageSkipButton, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when skipped', () => {
  const skippedInstance = { ...instance, skipped: true, skipped_reason: 'Motion Blur' }
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', skippedInstance)
  const wrapper = shallowMount(StageSkipButton, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('dispatches to workview when skipping', () => {
  const wrapper = shallowMount(StageSkipButton, { localVue, store })
  wrapper.find('discard-button-stub').vm.$emit('toggle-skip', 'Motion Blur')
  expect(store.dispatch)
    .toHaveBeenLastCalledWith('workview/skipStage', { stage: instance, reason: 'Motion Blur' })
})

it('self-assigns if stage not assigned', () => {
  const stage = { ...instance, assignee_id: null }
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('user/SET_PROFILE', buildUserPayload({ id: 5 }))
  const wrapper = shallowMount(StageSkipButton, { localVue, store })
  wrapper.find('discard-button-stub').vm.$emit('toggle-skip', 'Motion Blur')
  expect(store.dispatch)
    .toHaveBeenCalledWith('workview/assignStage', { stage, userId: 5 })
})

it('dispatches to workview when unskipping', () => {
  const skippedInstance = { ...instance, skipped: true, skipped_reason: 'Motion Blur' }
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', skippedInstance)
  const wrapper = shallowMount(StageSkipButton, { localVue, store })
  wrapper.find('discard-button-stub').vm.$emit('toggle-skip', 'Motion Blur')
  expect(store.dispatch)
    .toHaveBeenLastCalledWith('workview/unskipStage', skippedInstance)
})
