import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildMembershipPayload,
  buildStageAnnotationPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { initializeBlindWorkflow } from 'test/unit/factories/helpers'

import TestStageResults from '@/components/WorkView/TestStageResults.vue'
import { DatasetItemPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let item: DatasetItemPayload

beforeEach(() => {
  store = createTestStore()
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(TestStageResults, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

describe('when not on review blind stage', () => {
  itMatchesSnapshot()

  it('renders nothing', () => {
    const wrapper = shallowMount(TestStageResults, { localVue, store })
    expect(wrapper.html()).toEqual('')
  })
})

class AuthorModel {
  wrapper: Wrapper<Vue>
  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get text (): string {
    return this.wrapper.text()
  }

  async toggle (): Promise<void> {
    await this.wrapper.vm.$emit('toggle')
  }

  get selected (): boolean {
    return this.wrapper.props('selected')
  }
}

class Model {
  wrapper: Wrapper<Vue>
  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get everyone (): AuthorModel {
    const wrapper = this.wrapper.find('.results__authors__author:first-of-type')
    return new AuthorModel(wrapper)
  }

  get authors (): AuthorModel[] {
    return this.wrapper
      .findAll('.results__authors__author:not(:first-of-type)')
      .wrappers.map(wrapper => new AuthorModel(wrapper))
  }
}

describe('when on blind review stage', () => {
  const v7 = buildTeamPayload({ id: 7 })
  const jack = buildMembershipPayload({
    id: 1,
    user_id: 10,
    team_id: v7.id,
    first_name: 'Jack',
    last_name: 'Smith'
  })

  const sam = buildMembershipPayload({
    id: 2,
    user_id: 20,
    team_id: v7.id,
    first_name: 'Sam',
    last_name: 'Doe'

  })
  const mike = buildMembershipPayload({ id: 3, user_id: 30, team_id: v7.id })

  beforeEach(() => {
    item = initializeBlindWorkflow()
    const review = item.current_workflow!.stages[3][0]
    item.current_workflow!.current_workflow_stage_template_id = review.workflow_stage_template_id
    item.current_workflow!.current_stage_number = 3
    item.current_workflow!.stages[1][0].assignee_id = jack.user_id
    item.current_workflow!.stages[1][1].assignee_id = sam.user_id
    store.commit('team/SET_MEMBERSHIPS', [jack, sam, mike])
    store.commit('team/SET_CURRENT_TEAM', v7)
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', review)
  })

  itMatchesSnapshot()

  it('renders list of blind stage assignees to filter by', () => {
    const wrapper = shallowMount(TestStageResults, { localVue, store })
    const model = new Model(wrapper)
    expect(model.authors.length).toEqual(2)
    expect(model.authors[0].text).toEqual('Jack Smith')
    expect(model.authors[1].text).toEqual('Sam Doe')
  })

  it('allows toggling selection', async () => {
    const wrapper = shallowMount(TestStageResults, { localVue, store })
    const model = new Model(wrapper)

    await wrapper.vm.$nextTick()

    expect(model.everyone.selected).toBe(true)
    expect(model.authors[0].selected).toBe(false)
    expect(model.authors[1].selected).toBe(false)

    await model.authors[0].toggle()
    expect(model.everyone.selected).toBe(false)
    expect(model.authors[0].selected).toBe(true)
    expect(model.authors[1].selected).toBe(false)

    await model.authors[0].toggle()
    expect(model.everyone.selected).toBe(false)
    expect(model.authors[0].selected).toBe(false)
    expect(model.authors[1].selected).toBe(false)

    await model.authors[0].toggle()
    await model.authors[1].toggle()
    expect(model.everyone.selected).toBe(false)
    expect(model.authors[0].selected).toBe(true)
    expect(model.authors[1].selected).toBe(true)

    await model.everyone.toggle()
    expect(model.everyone.selected).toBe(true)
    expect(model.authors[0].selected).toBe(false)
    expect(model.authors[1].selected).toBe(false)
  })

  it('toggles annotation visibility when toggling selection', async () => {
    const [annotate1, annotate2] = item.current_workflow!.stages[1]
    const review = item.current_workflow!.stages[3][0]
    const annotations = [
      buildStageAnnotationPayload({ id: '1', iou_matches: [['foo', annotate1.id, 0.9]] }),
      buildStageAnnotationPayload({ id: '2', iou_matches: [['foo', annotate2.id, 0.9]] }),
      buildStageAnnotationPayload({ id: '3', iou_matches: [['foo', annotate2.id, 0.9]] })
    ]
    store.commit('workview/SET_STAGE_ANNOTATIONS', { stage: review, annotations })
    const wrapper = shallowMount(TestStageResults, { localVue, store })
    const model = new Model(wrapper)

    await wrapper.vm.$nextTick()

    expect(store.state.workview.stageAnnotations.map(a => a.isVisible))
      .toEqual([true, true, true])

    await model.authors[0].toggle()
    await flushPromises()
    expect(store.state.workview.stageAnnotations.map(a => a.isVisible))
      .toEqual([true, false, false])

    await model.authors[0].toggle()
    expect(store.state.workview.stageAnnotations.map(a => a.isVisible))
      .toEqual([false, false, false])

    await model.authors[0].toggle()
    await model.authors[1].toggle()
    expect(store.state.workview.stageAnnotations.map(a => a.isVisible))
      .toEqual([true, true, true])

    await model.authors[0].toggle()
    await model.authors[1].toggle()
    expect(store.state.workview.stageAnnotations.map(a => a.isVisible))
      .toEqual([false, false, false])

    await model.everyone.toggle()
    expect(store.state.workview.stageAnnotations.map(a => a.isVisible))
      .toEqual([true, true, true])

    await model.everyone.toggle()
    expect(store.state.workview.stageAnnotations.map(a => a.isVisible))
      .toEqual([false, false, false])
  })
})
