import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotationClassPayload,
  buildTrainingClass
} from 'test/unit/factories'
import { bean, bottle, flask, scale } from 'test/unit/fixtures/annotation-class-payloads'
import { Dropdown } from 'test/unit/stubs'

import { DropdownOption } from '@/components/Common/Dropdown/types'
import ClassMappingItem from '@/components/DatasetSettings/ModelStage/ClassMappingItem.vue'
import { MappedClass, UnmappedClass } from '@/components/DatasetSettings/ModelStage/types'
import { AnnotationClassPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.use(Vuex)

let propsData: {
  annotationClasses: AnnotationClassPayload[]
  mappedClass: MappedClass | UnmappedClass
}

const stubs = { Dropdown }

const model = {
  dropdown: 'dropdown-stub',
  errors: '.mapping-item__error',
  windSubs: '.mapping-item__wind-class__subs type-icon-stub',
  darwinSubs: '.mapping-item__option__subs type-icon-stub'
}

// Store only gets read, so it can be shared between tests
const store = createTestStore()
setDefaultAnnotationTypes(store)

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when mapped', () => {
  beforeEach(() => {
    propsData = {
      annotationClasses: [bottle, flask],
      mappedClass: {
        annotationClass: flask,
        modelClass: { id: 'foo', name: 'Flask', type: 'polygon', subs: [] }
      }
    }
  })

  itMatchesSnapshot()

  it('preselects class', () => {
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store })
    expect(wrapper.find(model.dropdown).props('value'))
      .toEqual(expect.objectContaining({ id: flask.id.toString() }))
  })

  it('emits on class selection', async () => {
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store })
    await wrapper.find(model.dropdown).vm.$emit('input', { id: bottle.id.toString() })
    expect(wrapper.emitted()['class-selected']![0]).toEqual([bottle])
  })
})

describe('when unmapped', () => {
  beforeEach(() => {
    propsData = {
      annotationClasses: [bottle, flask],
      mappedClass: {
        annotationClass: null,
        modelClass: buildTrainingClass({ id: 'bar', name: 'Flask', type: 'polygon' })
      }
    }
  })

  itMatchesSnapshot()

  it('leaves dropdown unselected', () => {
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store })
    expect(wrapper.find(model.dropdown).props('value'))
      .toEqual(expect.objectContaining({ id: 'NOTHING' }))
  })

  it('emits on class selection', async () => {
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store })
    await wrapper.find(model.dropdown).vm.$emit('input', { id: flask.id.toString() })
    expect(wrapper.emitted()['class-selected']![0]).toEqual([flask])
  })
})

it('filters out incompattible annotation classes', () => {
  propsData = {
    annotationClasses: [bottle, flask, scale, bean],
    mappedClass: {
      annotationClass: null,
      modelClass: buildTrainingClass({ id: 'bar', name: 'Flask', type: 'polygon' })
    }
  }
  const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store })
  // bean is ellipse, so not included
  expect(
    wrapper.find(model.dropdown).props('options').map((o: DropdownOption) => o.label)
  ).toEqual([
    'Nothing', 'Bottle', 'Flask', 'Scale'
  ])
})

describe('when model class has subs', () => {
  const windOCR = buildTrainingClass({
    id: 'id',
    name: 'OCR',
    type: 'polygon',
    subs: ['text', 'attributes']
  })

  beforeEach(() => {
    propsData = {
      annotationClasses: [flask, scale],
      mappedClass: {
        annotationClass: null,
        modelClass: windOCR
      }
    }
  })

  itMatchesSnapshot()

  it('renders subs as icons', () => {
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store })
    expect(wrapper.findAll(model.windSubs).wrappers.length).toBe(2)
  })

  it('excludes autoAnnotate from rendered subs', () => {
    windOCR.subs = ['auto_annotate']
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store })
    expect(wrapper.findAll(model.windSubs).wrappers.length).toBe(0)
  })

  it('excludes measures from rendered subs', () => {
    windOCR.subs = ['measures']
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store })
    expect(wrapper.findAll(model.windSubs).wrappers.length).toBe(0)
  })
})

describe('when darwin class has subs', () => {
  const windOCR = buildTrainingClass({ id: 'id', name: 'OCR', type: 'polygon' })
  const darwinOCR = buildAnnotationClassPayload({
    id: 99,
    annotation_types: ['polygon', 'text', 'directional_vector']
  })

  beforeEach(() => {
    propsData = {
      annotationClasses: [darwinOCR],
      mappedClass: { annotationClass: darwinOCR, modelClass: windOCR }
    }
  })

  itMatchesSnapshot()

  it('renders subs as icons', () => {
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store, stubs })
    expect(wrapper.findAll(model.darwinSubs).wrappers.length).toBe(2)
  })

  it('excludes autoAnnotate from rendered subs', () => {
    darwinOCR.annotation_types = ['polygon', 'auto_annotate']
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store, stubs })
    expect(wrapper.findAll(model.darwinSubs).wrappers.length).toBe(0)
  })

  it('excludes measures from rendered subs', () => {
    darwinOCR.annotation_types = ['polygon', 'measures']
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store, stubs })
    expect(wrapper.findAll(model.darwinSubs).wrappers.length).toBe(0)
  })
})

describe('when mapped class has errors', () => {
  const darwinOCR = buildAnnotationClassPayload({
    annotation_types: ['polygon']
  })

  const windOCR = buildTrainingClass({
    id: 'id',
    name: 'OCR',
    type: 'polygon',
    subs: ['text']
  })

  beforeEach(() => {
    propsData = {
      annotationClasses: [darwinOCR],
      mappedClass: {
        annotationClass: darwinOCR,
        modelClass: windOCR
      }
    }
  })

  itMatchesSnapshot()

  it('renders error if mapped class has incompatible subs', () => {
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store })
    expect(wrapper.findAll(model.errors).wrappers.length).toBe(1)
  })

  it('does not validate presence of auto_annotate', () => {
    windOCR.subs = ['auto_annotate']
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store })
    expect(wrapper.findAll(model.errors).wrappers.length).toBe(0)
  })

  it('does not validate presence of measures', () => {
    windOCR.subs = ['measures']
    const wrapper = shallowMount(ClassMappingItem, { localVue, propsData, store })
    expect(wrapper.findAll(model.errors).wrappers.length).toBe(0)
  })
})
