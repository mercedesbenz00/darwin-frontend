import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildV2DARCWorkflow,
  buildV2WorkflowItemStatePayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'
import Model from 'test/unit/pageModels/Model'

import { SkippedReason } from '@/store/types'

import StageSkipButton from './StageSkipButton.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

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
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(StageSkipButton, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

class PageModel extends Model {
  declare wrapper: Wrapper<Vue>

  toggleSkip (reason: SkippedReason): Vue {
    return this.wrapper.find('discard-button-stub').vm.$emit('toggle-skip', reason)
  }
}

it('dispatches action on toggle skip', async () => {
  const wrapper = shallowMount(StageSkipButton, { localVue, store })
  const model = new PageModel(wrapper)
  await model.toggleSkip('Motion Blur')
  expect(store.dispatch).toHaveBeenCalledWith('workview/skipV2SelectedStageInstance', 'Motion Blur')
})

it('dispatches action to clear skip if already skipped with specified reason', async () => {
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', {
    ...instance,
    data: {
      ...instance.data,
      skipped_reason: 'Motion Blur'
    }
  })
  const wrapper = shallowMount(StageSkipButton, { localVue, store })
  const model = new PageModel(wrapper)
  await model.toggleSkip('Motion Blur')
  expect(store.dispatch).toHaveBeenCalledWith('workview/skipV2SelectedStageInstance', null)
})
