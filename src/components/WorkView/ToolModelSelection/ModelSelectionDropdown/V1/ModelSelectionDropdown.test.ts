import { createLocalVue, mount } from '@vue/test-utils'

import { ModelType } from '@/store/types'

import ModelSelectionDropdown from './ModelSelectionDropdown.vue'

const localVue = createLocalVue()

const sampleModelOptions = [
  {
    id: 1,
    text: 'Model 1',
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
    text: 'Model 2',
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
    text: 'Model 3',
    type: ModelType.InstanceSegmentation
  },
  {
    id: 3,
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
    text: 'Model 3',
    type: ModelType.Classification
  }
]

const mountWithModelData = () => {
  return mount(ModelSelectionDropdown, {
    localVue,
    stubs: {
      Select2: true
    },
    propsData: {
      value: null,
      options: sampleModelOptions
    }
  })
}
it('correctly renders ModelSelectionDropdown', () => {
  const wrapper = mountWithModelData()
  // TODO: Resolve the conflict with requirejs and add right testings.
  // TODO: Mainly Select2 should be tested properly.
  expect(wrapper.element).toMatchSnapshot()
})
