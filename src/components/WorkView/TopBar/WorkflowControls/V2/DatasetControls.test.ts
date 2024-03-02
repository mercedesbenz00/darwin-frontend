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

import DatasetControls from './DatasetControls.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const workflow = buildV2DARCWorkflow()
const stage = workflow.stages.find(s => s.type === StageType.Dataset)
const instance = buildV2WorkflowStageInstancePayload({ stage })
const itemState = buildV2WorkflowItemStatePayload({
  current_stage_instances: [instance],
  workflow
})

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(DatasetControls, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

class PageModel extends Model {
  declare wrapper: Wrapper<Vue>

  clickSendToNextStage (): Vue {
    return this.wrapper.find('continue-button-stub').vm.$emit('continue')
  }
}

it('dispatches action to transition into next stage', async () => {
  const wrapper = shallowMount(DatasetControls, { localVue, store })
  const model = new PageModel(wrapper)
  await model.clickSendToNextStage()
  expect(store.dispatch).toHaveBeenCalledWith('workview/transitionFromV2DatasetStage')
})
