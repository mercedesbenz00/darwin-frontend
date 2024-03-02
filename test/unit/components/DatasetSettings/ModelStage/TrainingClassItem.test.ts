import { createLocalVue, shallowMount } from '@vue/test-utils'

import createTestStore from 'test/unit/createTestStore'
import { buildModelStageTemplatePayload, buildTrainingClass } from 'test/unit/factories'

import TrainingClassItem from '@/components/DatasetSettings/ModelStage/TrainingClassItem.vue'
import { TrainingClass, ModelStageTemplatePayload } from '@/store/types'

const localVue = createLocalVue()

let store: ReturnType<typeof createTestStore>
let propsData: {
  trainingClass: TrainingClass
  stageTemplate: ModelStageTemplatePayload
}

const trainingClasses: TrainingClass[] = [
  buildTrainingClass({ id: 'model-1', darwin_id: 11, name: 'Box11', type: 'bounding_box' }),
  buildTrainingClass({ id: 'model-2', darwin_id: 22, name: 'Box22', type: 'bounding_box' })
]

const modelStage = buildModelStageTemplatePayload({
  id: 5,
  name: 'AI Model',
  metadata: {
    class_mapping: [
      { annotation_class_id: 1, model_class_label: trainingClasses[1].name },
      { annotation_class_id: null, model_class_label: trainingClasses[1].name }
    ]
  }
})

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(TrainingClassItem, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when unmapped', () => {
  beforeEach(() => {
    propsData = {
      trainingClass: trainingClasses[0],
      stageTemplate: modelStage
    }
  })

  itMatchesSnapshot()

  it('renders as unmapped', () => {
    const wrapper = shallowMount(TrainingClassItem, { localVue, propsData, store })
    expect(wrapper.classes()).toContain('training-class--unmapped')
  })
})

describe('when mapped', () => {
  beforeEach(() => {
    propsData = {
      trainingClass: trainingClasses[1],
      stageTemplate: modelStage
    }
  })

  itMatchesSnapshot()

  it('renders as mapped', () => {
    const wrapper = shallowMount(TrainingClassItem, { localVue, propsData, store })
    expect(wrapper.classes()).not.toContain('training-class--unmapped')
  })
})
