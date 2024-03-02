import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildV2DARCWorkflow,
  buildV2WorkflowItemStatePayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'
import Model from 'test/unit/pageModels/Model'
import { emitRootStub } from 'test/unit/testHelpers'

import { StageType } from '@/store/types'

import CompleteControls from './CompleteControls.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const workflow = buildV2DARCWorkflow()
const stage = workflow.stages.find(s => s.type === StageType.Complete)
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
  const wrapper = shallowMount(CompleteControls, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

class PageModel extends Model {
  clickRestart (): Promise<void> {
    return emitRootStub(this.wrapper, 'restart')
  }
}

it('dispatches action on restart', async () => {
  const wrapper = shallowMount(CompleteControls, { localVue, store })
  const model = new PageModel(wrapper)
  await model.clickRestart()
  expect(store.dispatch).toHaveBeenCalledWith('workview/restartV2WorkflowItem')
})
