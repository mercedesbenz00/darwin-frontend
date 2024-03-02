import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildV2DARCWorkflow,
  buildV2WorkflowItemStatePayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'

import {
  StageActionType,
  StageType,
  V2WorkflowItemStatePayload,
  V2WorkflowStageInstancePayload
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const GETTER = 'workview/v2StageCurrentAction'

const workflow = buildV2DARCWorkflow()
let itemState: V2WorkflowItemStatePayload
let instance: V2WorkflowStageInstancePayload

const annotate = workflow.stages.find(s => s.type === StageType.Annotate)
const review = workflow.stages.find(s => s.type === StageType.Review)
const complete = workflow.stages.find(s => s.type === StageType.Complete)
const dataset = workflow.stages.find(s => s.type === StageType.Dataset)

describe('Dataset-Annotate-Review-Complete', () => {
  describe('on dataset', () => {
    beforeEach(() => {
      instance = buildV2WorkflowStageInstancePayload({ stage: dataset })
      store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
      itemState = buildV2WorkflowItemStatePayload({ workflow, current_stage_instances: [instance] })
      store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
    })

    it(`returns ${StageActionType.SendToAnnotate}`, () => {
      expect(store.getters[GETTER]).toEqual(StageActionType.SendToAnnotate)
    })
  })

  describe('on annotate', () => {
    beforeEach(() => {
      instance = buildV2WorkflowStageInstancePayload({ stage: annotate })
      store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
      itemState = buildV2WorkflowItemStatePayload({ workflow, current_stage_instances: [instance] })
      store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
    })

    it(`returns ${StageActionType.SendToReview}`, () => {
      expect(store.getters[GETTER]).toEqual(StageActionType.SendToReview)
    })

    describe('when skipped', () => {
      beforeEach(() => {
        instance.data.skipped_reason = 'Motion Blur'
        store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
        itemState.current_stage_instances = [instance]
        store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
      })
      it(`returns ${StageActionType.Skip}`, () => {
        expect(store.getters[GETTER]).toEqual(StageActionType.Skip)
      })
    })
  })

  describe('on review', () => {
    beforeEach(() => {
      instance = buildV2WorkflowStageInstancePayload({ stage: review })
      store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
      itemState.current_stage_instances = [instance]
      store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
    })

    it(`returns ${StageActionType.MarkAsComplete}`, () => {
      expect(store.getters[GETTER]).toEqual(StageActionType.MarkAsComplete)
    })

    describe('when skipped', () => {
      beforeEach(() => {
        instance.data.skipped_reason = 'Motion Blur'
        store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
        itemState.current_stage_instances = [instance]
        store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
      })

      it(`returns ${StageActionType.Archive}`, () => {
        expect(store.getters[GETTER]).toEqual(StageActionType.Archive)
      })
    })

    describe('rejecting', () => {
      beforeEach(() => {
        instance.data.active_edge = 'reject'
        instance.data.scheduled_to_complete_at = '2030-01-01'

        store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)

        itemState.current_stage_instances = [instance]
        store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
      })

      it(`returns ${StageActionType.SendBack}`, () => {
        expect(store.getters[GETTER]).toEqual(StageActionType.SendBack)
      })
    })
  })

  describe('on complete', () => {
    beforeEach(() => {
      instance = buildV2WorkflowStageInstancePayload({ stage: complete })
      store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
      itemState.current_stage_instances = [instance]
      store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
    })

    it(`returns ${StageActionType.Completed}`, () => {
      expect(store.getters[GETTER]).toEqual(StageActionType.Completed)
    })
  })
})
