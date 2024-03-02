import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildV2DARCWorkflow,
  buildV2WorkflowItemStatePayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'
import Model from 'test/unit/pageModels/Model'
import { emitRootStub } from 'test/unit/testHelpers'

import { installCommonComponents } from '@/plugins/components'

import BackToThePresent from './BackToThePresent.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', () => stubDirectiveWithAttribute)
localVue.use(Vuex)
installCommonComponents(localVue)
let store: ReturnType<typeof createTestStore>

const workflow = buildV2DARCWorkflow()
const instance = buildV2WorkflowStageInstancePayload({ stage: workflow.stages[0] })
const itemState = buildV2WorkflowItemStatePayload({
  current_stage_instances: [instance],
  workflow
})

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(BackToThePresent, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

class PageModel extends Model {
  clickBackToThePresent (): Promise<void> {
    return emitRootStub(this.wrapper, 'click')
  }
}

it('selects present stage on restart', async () => {
  const wrapper = shallowMount(BackToThePresent, { localVue, store })
  const model = new PageModel(wrapper)
  await model.clickBackToThePresent()
  expect(store.state.workview.v2SelectedStageInstance).toEqual(instance)
  expect(store.state.workview.v2SelectedStage).toEqual(instance.stage)
})
