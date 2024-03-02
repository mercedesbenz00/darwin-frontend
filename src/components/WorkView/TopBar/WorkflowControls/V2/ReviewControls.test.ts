import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildV2DARCWorkflow,
  buildV2WorkflowItemStatePayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'
import Model from 'test/unit/pageModels/Model'

import { StageType } from '@/store/types'

import ReviewControls from './ReviewControls.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const workflow = buildV2DARCWorkflow()
const stage = workflow.stages.find(s => s.type === StageType.Review)
const instance = buildV2WorkflowStageInstancePayload({ stage })
const itemState = buildV2WorkflowItemStatePayload({
  current_stage_instances: [instance],
  workflow
})

jest.mock('@/composables/useRouter')

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(ReviewControls, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

class PageModel extends Model {
  declare wrapper: Wrapper<Vue>

  clickApprove (): Vue {
    return this.wrapper.find('continue-button-stub').vm.$emit('continue')
  }

  clickReject (): Vue {
    return this.wrapper.find('stage-reject-button-stub').vm.$emit('click')
  }

  clickCancel (): Vue {
    return this.wrapper.find('continue-button-stub').vm.$emit('cancel')
  }
}

it('dispatches action on approve', async () => {
  const wrapper = shallowMount(ReviewControls, { localVue, store })
  const model = new PageModel(wrapper)
  await model.clickApprove()
  expect(store.dispatch).toHaveBeenCalledWith('workview/approveV2ReviewStage')
})

it('dispatches action on reject', async () => {
  const wrapper = shallowMount(ReviewControls, { localVue, store })
  const model = new PageModel(wrapper)
  await model.clickReject()
  expect(store.dispatch).toHaveBeenCalledWith('workview/rejectV2ReviewStage')
})

it('dispatches action on cancel', async () => {
  const wrapper = shallowMount(ReviewControls, { localVue, store })
  const model = new PageModel(wrapper)
  await model.clickCancel()
  expect(store.dispatch).toHaveBeenCalledWith('workview/cancelV2StageAutoComplete')
})
