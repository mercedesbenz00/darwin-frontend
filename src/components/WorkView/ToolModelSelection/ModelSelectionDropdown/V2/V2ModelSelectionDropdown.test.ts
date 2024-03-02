import { createLocalVue, mount, Wrapper } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import clickOutsideDirective from '@/directives/click-outside'
import { ModelType } from '@/store/types'

import V2ModelSelectionDropdown from './V2ModelSelectionDropdown.vue'

const localVue = createLocalVue()
localVue.use(VTooltip, { defaultHtml: true })
localVue.use(Vuex)
localVue.directive('click-outside', clickOutsideDirective)

const stubs = {
  'router-link': true
}

let store: ReturnType<typeof createTestStore>

const sampleModelOptions = [
  {
    id: 1,
    label: 'Model 1',
    type: ModelType.AutoAnnotation
  },
  {
    id: 2,
    classes: [
      {
        name: 'Class 1',
        color: { r: 10, g: 20, b: 30, a: 1.0 }
      }
    ],
    label: 'Model 2',
    type: ModelType.ObjectDetection
  },
  {
    id: 3,
    classes: [
      {
        name: 'Class 2',
        color: { r: 10, g: 20, b: 30, a: 1.0 }
      },
      {
        name: 'Class 3',
        color: { r: 20, g: 30, b: 40, a: 1.0 }
      }
    ],
    label: 'Model 3',
    type: ModelType.InstanceSegmentation
  },
  {
    id: 4,
    classes: [
      {
        name: 'Class 1',
        color: { r: 10, g: 20, b: 30, a: 1.0 }
      },
      {
        name: 'Class 2',
        color: { r: 20, g: 30, b: 40, a: 1.0 }
      },
      {
        name: 'Class 3',
        color: { r: 30, g: 40, b: 50, a: 1.0 }
      },
      {
        name: 'Class 4',
        color: { r: 40, g: 50, b: 60, a: 1.0 }
      },
      {
        name: 'Class 5',
        color: { r: 50, g: 60, b: 70, a: 1.0 }
      }
    ],
    label: 'Model 3',
    type: ModelType.Classification
  }
]

beforeEach(() => {
  store = createTestStore()
})

const mountWitouthModelData = (): Wrapper<Vue, Element> => {
  return mount(V2ModelSelectionDropdown, {
    localVue,
    propsData: {
      value: '',
      options: sampleModelOptions
    },
    stubs,
    store
  })
}

const mountWithModelData = (): Wrapper<Vue, Element> => {
  return mount(V2ModelSelectionDropdown, {
    localVue,
    propsData: {
      value: 1,
      options: sampleModelOptions
    },
    stubs,
    store
  })
}

jest.mock('@/engineV2/workers/FramesLoaderWorker')

it('correctly renders V2ModelSelectionDropdown when passing a selected value', () => {
  const wrapper = mountWithModelData()
  expect(wrapper.element).toMatchSnapshot()
})

it('correctly renders V2ModelSelectionDropdown when not passing a selected value', () => {
  const wrapper = mountWitouthModelData()
  expect(wrapper.element).toMatchSnapshot()
})

describe('when submitting using arrow keys', () => {
  let wrapper: Wrapper<Vue, Element>
  // let inputSearch: Wrapper<Vue, Element>

  beforeEach(() => {
    wrapper = mountWithModelData()
  })

  it('select the next value open and hitting ARROW DOWN', async () => {
    wrapper.setData({ open: true })
    const selectField = wrapper.find('.select-field')
    await selectField.setData({ open: true })
    const searchField = wrapper.find('.search-field')
    expect((wrapper.vm as any).sel).toEqual(1)
    await searchField.vm.$emit('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted()?.input).toEqual([[1], [2]])
  })

  it('do not select the next value closed and hitting ARROW DOWN', async () => {
    const selectField = wrapper.find('.select-field')
    await selectField.setData({ open: true })
    const searchField = wrapper.find('.search-field')
    await searchField.vm.$emit('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted()?.input).toEqual([[1]])
  })

  it('select the next value open and hitting ARROW UP', async () => {
    wrapper.setData({ open: true })
    const selectField = wrapper.find('.select-field')
    await selectField.setData({ open: true })
    const searchField = wrapper.find('.search-field')
    expect((wrapper.vm as any).sel).toEqual(1)
    await searchField.vm.$emit('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted()?.input).toEqual([[1], [4]])
  })

  it('do not select the next value closed and hitting ARROW UP', async () => {
    const selectField = wrapper.find('.select-field')
    await selectField.setData({ open: true })
    const searchField = wrapper.find('.search-field')
    await searchField.vm.$emit('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted()?.input).toEqual([[1]])
  })

  it('select the next value open and hitting ENTER', async () => {
    wrapper.setData({ open: true })
    const selectField = wrapper.find('.select-field')
    await selectField.setData({ open: true })
    const searchField = wrapper.find('.search-field')
    expect((wrapper.vm as any).sel).toEqual(1)
    await searchField.vm.$emit('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted()?.input).toEqual([[1], [4]])
  })

  it('close the dropdown after hitting ENTER', async () => {
    await wrapper.find('.select-field').setData({ open: true })
    await wrapper.setData({ open: true })
    expect(wrapper.find('.select-field__input--open').exists()).toBe(true)
    
    await wrapper.find('.search-field').vm.$emit('keydown', { key: 'Enter' })
    expect(wrapper.find('.select-field__input--open').exists()).toBe(false)
  })

  it('close the dropdown after hitting ESCAPE', async () => {
    await wrapper.find('.select-field').setData({ open: true })
    await wrapper.setData({ open: true })
    expect(wrapper.find('.select-field__input--open').exists()).toBe(true)
    
    await wrapper.find('.search-field').vm.$emit('keydown', { key: 'Escape' })
    expect(wrapper.find('.select-field__input--open').exists()).toBe(false)
  })
})
