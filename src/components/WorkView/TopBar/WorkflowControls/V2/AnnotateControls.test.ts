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

import AnnotateControls from './AnnotateControls.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const workflow = buildV2DARCWorkflow()
const stage = workflow.stages.find(s => s.type === StageType.Annotate)
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
  const wrapper = shallowMount(AnnotateControls, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

class PageModel extends Model {
  declare wrapper: Wrapper<Vue>

  clickSendToReview (): Vue {
    return this.wrapper.find('continue-button-stub').vm.$emit('continue')
  }

  clickCancel (): Vue {
    return this.wrapper.find('continue-button-stub').vm.$emit('cancel')
  }
}

it('dispatches action on send to review', async () => {
  const wrapper = shallowMount(AnnotateControls, { localVue, store })
  const model = new PageModel(wrapper)
  await model.clickSendToReview()
  expect(store.dispatch).toHaveBeenCalledWith('workview/setV2AnnotateStageAutoComplete')
})

it('dispatches action on cancel', async () => {
  const wrapper = shallowMount(AnnotateControls, { localVue, store })
  const model = new PageModel(wrapper)
  await model.clickCancel()
  expect(store.dispatch).toHaveBeenCalledWith('workview/cancelV2StageAutoComplete')
})
