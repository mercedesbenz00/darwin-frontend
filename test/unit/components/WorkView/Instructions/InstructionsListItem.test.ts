import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { flask, tag } from 'test/unit/fixtures/annotation-class-payloads'

import InstructionsListItem from '@/components/WorkView/Instructions/InstructionsListItem.vue'
import { AnnotationClassPayload } from '@/store/types'

const localVue = createLocalVue()

localVue.prototype.$ga = { event () { } }

localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  annotationClass: AnnotationClassPayload
  hotkey?: string | null
  isExpanded?: boolean
  isSelectable?: boolean
}

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  propsData = { annotationClass: flask }
})

it('matches snapshot when not expanded', () => {
  propsData.isExpanded = false
  const wrapper = shallowMount(InstructionsListItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when not selectable', () => {
  propsData.isExpanded = false
  const wrapper = shallowMount(InstructionsListItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when expanded', () => {
  propsData.isExpanded = true
  const wrapper = shallowMount(InstructionsListItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selectable', () => {
  propsData.isSelectable = true
  const wrapper = shallowMount(InstructionsListItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when tag', () => {
  propsData.isSelectable = true
  propsData.annotationClass = tag
  const wrapper = shallowMount(InstructionsListItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when hotkey is set', () => {
  propsData.hotkey = '1'
  const wrapper = shallowMount(InstructionsListItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('selects class on click if selectable', () => {
  propsData.isSelectable = true
  propsData.annotationClass = flask
  const wrapper = shallowMount(InstructionsListItem, { localVue, propsData, store })
  wrapper.find('.annotation-class__button').trigger('click')
  expect(store.state.workview.preselectedAnnotationClassId).toEqual(flask.id)
})

it('does not select class on click if not selectable', () => {
  propsData.isSelectable = false
  propsData.annotationClass = flask
  const wrapper = shallowMount(InstructionsListItem, { localVue, propsData, store })
  wrapper.find('.annotation-class__button').trigger('click')
  expect(store.state.workview.preselectedAnnotationClassId).toEqual(null)
})

it('does not select class on click if tag', () => {
  propsData.isSelectable = true
  propsData.annotationClass = tag
  const wrapper = shallowMount(InstructionsListItem, { localVue, propsData, store })
  wrapper.find('.annotation-class__button').trigger('click')
  expect(store.state.workview.preselectedAnnotationClassId).toEqual(null)
})
