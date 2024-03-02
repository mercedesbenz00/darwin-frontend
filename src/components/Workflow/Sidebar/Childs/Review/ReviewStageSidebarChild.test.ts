import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildV2DARCWorkflow } from 'test/unit/factories'

import { V2ReviewStagePayload } from '@/store/types'

import ReviewStageSidebarChild from './ReviewStageSidebarChild.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>

let propsData: {
  stage: V2ReviewStagePayload
}

const workflow = buildV2DARCWorkflow()

beforeEach(() => {
  store = createTestStore()
  store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflow)
  propsData = {
    stage: workflow.stages.find((s): s is V2ReviewStagePayload => s.type === 'review')!
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ReviewStageSidebarChild, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('save stage config when changes read only checkbox', async () => {
  const wrapper = shallowMount(ReviewStageSidebarChild, { localVue, propsData, store })

  const storeStage = store.state.v2Workflow.editedWorkflow!.stages
    .find((s): s is V2ReviewStagePayload => s.type === 'review')!

  await wrapper.find('check-box-stub').vm.$emit('change', { checked: true })
  expect(storeStage.config.readonly).toBe(true)
  await wrapper.find('check-box-stub').vm.$emit('change', { checked: false })
  expect(storeStage.config.readonly).toBe(false)
})
