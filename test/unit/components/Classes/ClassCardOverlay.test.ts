import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildAnnotationClassPayload, buildDatasetPayload } from 'test/unit/factories'

import ClassCardOverlay from '@/components/Classes/ClassCardOverlay.vue'
import { AnnotationClassPayload, DatasetPayload } from '@/store/types'

const localVue = createLocalVue()

let propsData: {
  annotationClass: AnnotationClassPayload
  dataset?: DatasetPayload | null
  selected?: boolean
  isNonDataset?: boolean
}

beforeEach(() => {
  propsData = {
    annotationClass: buildAnnotationClassPayload({})
  }
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(ClassCardOverlay, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

it('should emit edit', async () => {
  const wrapper = shallowMount(ClassCardOverlay, { localVue, propsData })
  await wrapper.findAll('.class-card-overlay__button').at(0).trigger('click')
  expect(wrapper.emitted().edit).toBeDefined()
})

it('should emit update:selected', async () => {
  const wrapper = shallowMount(ClassCardOverlay, { localVue, propsData })
  await wrapper.find('check-box-stub').vm.$emit('input', true)
  expect(wrapper.emitted()['update:selected']).toEqual([[true]])
})

describe('with dataset', () => {
  beforeEach(() => {
    propsData.dataset = buildDatasetPayload()
  })

  describe('when dataset annotation class', () => {
    beforeEach(() => {
      propsData.isNonDataset = false
    })

    itMatchesSnapshot()

    it('should emit remove-from-dataset', async () => {
      const wrapper = shallowMount(ClassCardOverlay, { localVue, propsData })
      await wrapper.findAll('.class-card-overlay__button').at(0).trigger('click')
      expect(wrapper.emitted()['remove-from-dataset']).toBeDefined()
    })
  })

  describe('when non-dataset annotation class', () => {
    beforeEach(() => {
      propsData.isNonDataset = true
    })

    itMatchesSnapshot()

    it('should emit add-to-datset', async () => {
      const wrapper = shallowMount(ClassCardOverlay, { localVue, propsData })
      await wrapper.findAll('.class-card-overlay__button').at(0).trigger('click')
      expect(wrapper.emitted()['add-to-dataset']).toBeDefined()
    })
  })
})

describe('when selected', () => {
  beforeEach(() => {
    propsData.selected = true
  })

  itMatchesSnapshot()
})
