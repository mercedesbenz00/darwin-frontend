import { shallowMount, createLocalVue, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetAnnotationReportPayload,
  buildDatasetAnnotatorPayload,
  buildDatasetPayload,
  buildMembershipPayload,
  buildTeamPayload,
  buildUserPayload
} from 'test/unit/factories'

import AnnotatorStats from '@/components/Annotators/AnnotationMetrics/AnnotatorStats.vue'
import { AnnotationDataRange } from '@/components/Annotators/AnnotationMetrics/types'
import { DatasetAnnotationReportPayload, DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const v7 = buildTeamPayload({ id: 1, name: 'V7', slug: 'v7' })
const sfh = buildDatasetPayload({ id: 5, slug: 'sfh', name: 'SFH', team_id: v7.id })

const sam = buildUserPayload({ id: 1, email: 'sam@v7labs.com' })
const jim = buildUserPayload({ id: 2, email: 'jim@v7labs.com' })

const samV7Member = buildMembershipPayload({
  id: 1,
  user_id: sam.id,
  team_id: v7.id,
  role: 'annotator'
})
const jimV7Member = buildMembershipPayload({
  id: 2,
  user_id: jim.id,
  team_id: v7.id,
  role: 'annotator'
})

const samSfhAnnotator = buildDatasetAnnotatorPayload({ id: 1, user_id: sam.id, dataset_id: sfh.id })
const jimSfhAnnotator = buildDatasetAnnotatorPayload({ id: 2, user_id: jim.id, dataset_id: sfh.id })

const sfhAnnotationReport = [
  buildDatasetAnnotationReportPayload({
    annotation_time: 10, annotations_created: 5, annotations_approved: 3, user_id: sam.id
  }),
  buildDatasetAnnotationReportPayload({
    annotation_time: 5, annotations_created: 10, annotations_approved: 3, user_id: jim.id
  })
]

const sfhTotalReport = [
  buildDatasetAnnotationReportPayload({
    annotation_time: 15, annotations_created: 15, annotations_approved: 6
  })
]

let store: ReturnType<typeof createTestStore>
let propsData: {
  byUserReport: DatasetAnnotationReportPayload[],
  totalReport: DatasetAnnotationReportPayload[],
  dataset: DatasetPayload
  dataRange: AnnotationDataRange
}
let stubs: Stubs

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('dataset/PUSH_DATASET', sfh)
  store.commit('dataset/PUSH_ANNOTATORS_FOR_DATASET', {
    datasetId: sfh.id,
    data: [samSfhAnnotator, jimSfhAnnotator]
  })
  store.commit('team/SET_MEMBERSHIPS', [samV7Member, jimV7Member])

  propsData = {
    byUserReport: sfhAnnotationReport,
    totalReport: sfhTotalReport,
    dataRange: 'total',
    dataset: sfh
  }

  stubs = ['router-link']
})

describe('ui/ux behavior', () => {
  it('matches snapshot when collapsed', () => {
    const wrapper = shallowMount(AnnotatorStats, { localVue, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot when expanded', async () => {
    const wrapper = shallowMount(AnnotatorStats, { localVue, propsData, store, stubs })
    wrapper.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot when no annotators', () => {
    store.commit('team/SET_MEMBERSHIPS', [])
    const wrapper = shallowMount(AnnotatorStats, { localVue, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('expands and collapses', async () => {
    const wrapper = shallowMount(AnnotatorStats, { localVue, propsData, store, stubs })
    wrapper.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.expanded).toBe(true)
    wrapper.find('.stats__collapse-button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.expanded).toBe(false)
  })

  it('updates dimension on selector "select" event', async () => {
    const wrapper = shallowMount(AnnotatorStats, { localVue, propsData, store, stubs })
    wrapper.trigger('click')
    await wrapper.vm.$nextTick()

    wrapper.find('dimension-selector-stub').vm.$emit('select', 'reviewPassRate')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.dimension).toEqual('reviewPassRate')
  })
})

describe('visibility', () => {
  beforeEach(() => {
    store.commit('dataset/PUSH_ANNOTATORS_FOR_DATASET', {
      datasetId: sfh.id,
      data: [samSfhAnnotator, jimSfhAnnotator]
    })

    store.commit('team/SET_MEMBERSHIPS', [
      samV7Member,
      jimV7Member,
      buildMembershipPayload({ id: 3, user_id: 3, team_id: v7.id, role: 'owner' }),
      buildMembershipPayload({ id: 4, user_id: 4, team_id: v7.id, role: 'admin' }),
      buildMembershipPayload({ id: 5, user_id: 5, team_id: v7.id, role: 'member' })
    ])

    propsData.byUserReport = []
    propsData.totalReport = []
  })

  it('makes "total" visible on prop change', () => {
    const wrapper = shallowMount(AnnotatorStats, { localVue, propsData, store })
    expect(wrapper.vm.$data.visibleMemberIds).toEqual(['total'])
  })

  it('updates visibility when clicking annotator', async () => {
    const wrapper = shallowMount(AnnotatorStats, { localVue, propsData, store })
    wrapper.trigger('click')
    await wrapper.vm.$nextTick()

    wrapper.findAll('member-toggle-stub').at(0).vm.$emit('click', { shiftKey: false })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.visibleMemberIds).toEqual(['total', 1])
    wrapper.findAll('member-toggle-stub').at(0).vm.$emit('click', { shiftKey: false })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.visibleMemberIds).toEqual(['total'])
  })

  it('updates visibility when shift-clicking annotator', async () => {
    const wrapper = shallowMount(AnnotatorStats, { localVue, propsData, store })
    wrapper.trigger('click')
    await wrapper.vm.$nextTick()

    wrapper.findAll('member-toggle-stub').at(0).vm.$emit('click', { shiftKey: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.visibleMemberIds).toEqual([1])
    wrapper.findAll('member-toggle-stub').at(1).vm.$emit('click', { shiftKey: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.visibleMemberIds).toEqual([2])
  })

  it('updates visibility when clicking "total"', async () => {
    const wrapper = shallowMount(AnnotatorStats, { localVue, propsData, store })
    wrapper.trigger('click')
    await wrapper.vm.$nextTick()

    wrapper.findAll('all-toggle-stub').at(0).vm.$emit('click', { shiftKey: false })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.visibleMemberIds).toEqual([])
    wrapper.findAll('all-toggle-stub').at(1).vm.$emit('click', { shiftKey: false })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.visibleMemberIds).toEqual(['total'])
  })

  it('updates visibility when shift-clicking "total"', async () => {
    const wrapper = shallowMount(AnnotatorStats, { localVue, propsData, store })
    wrapper.trigger('click')
    await wrapper.vm.$nextTick()

    wrapper.findAll('all-toggle-stub').at(0).vm.$emit('click', { shiftKey: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.visibleMemberIds).toEqual(['total'])
  })

  it('updates visibility when setting dimension', async () => {
    const wrapper = shallowMount(AnnotatorStats, { localVue, propsData, store })
    wrapper.trigger('click')
    await wrapper.vm.$nextTick()

    wrapper.findAll('dimension-selector-stub').at(0).vm.$emit('select', 'annotationTime')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.visibleMemberIds).toEqual(['total'])

    wrapper.findAll('dimension-selector-stub').at(1).vm.$emit('select', 'annotationTime')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.visibleMemberIds).toEqual(['total', 1])
  })
})
