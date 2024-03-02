import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore, { setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { bottle, flask, scale } from 'test/unit/fixtures/annotation-class-payloads'

import { ClassOverallDistribution, DistributionStatus } from '@/components/Dataset/ClassDistribution/types'
import SelectableClass from '@/components/ModelCreation/SelectableClass.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  distribution: ClassOverallDistribution
}

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  store.commit('neuralModel/SET_NEW_MODEL_ANNOTATION_CLASSES', [flask, bottle])
  propsData = {
    distribution: {
      annotationClass: flask,
      countByImages: 10,
      countByInstances: 20,
      status: DistributionStatus.BALANCED
    }
  }
})

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(SelectableClass, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when selected', () => {
  beforeEach(() => {
    store.commit('neuralModel/TOGGLE_NEW_MODEL_CLASS_SELECTION', flask)
  })

  itMatchesSnapshot()
})

describe('when eligible', () => {
  itMatchesSnapshot()

  it('toggles selection', () => {
    const wrapper = shallowMount(SelectableClass, { localVue, propsData, store })
    wrapper.find('button').trigger('click')
    expect(store.state.neuralModel.newModelSelectedClassIds).toEqual([flask.id])
    wrapper.find('button').trigger('click')
    expect(store.state.neuralModel.newModelSelectedClassIds).toEqual([])
  })
})

describe('when ineligible due to incompatible type', () => {
  beforeEach(() => {
    propsData.distribution = {
      annotationClass: scale,
      countByImages: 10,
      countByInstances: 20,
      status: DistributionStatus.BALANCED
    }
  })

  itMatchesSnapshot()

  it('renders disabled', () => {
    const wrapper = shallowMount(SelectableClass, { localVue, propsData, store })
    expect(wrapper.find('button').attributes('disabled')).toEqual('disabled')
  })
})

describe('when ineligible due to low count', () => {
  beforeEach(() => {
    propsData.distribution.status = DistributionStatus.LOW_DATA
  })

  itMatchesSnapshot()

  it('renders disabled', () => {
    const wrapper = shallowMount(SelectableClass, { localVue, propsData, store })
    expect(wrapper.find('button').attributes('disabled')).toEqual('disabled')
  })
})

describe('when ineligible due to no instances', () => {
  beforeEach(() => {
    propsData.distribution.countByInstances = 0
  })

  itMatchesSnapshot()

  it('renders disabled', () => {
    const wrapper = shallowMount(SelectableClass, { localVue, propsData, store })
    expect(wrapper.find('button').attributes('disabled')).toEqual('disabled')
  })
})
