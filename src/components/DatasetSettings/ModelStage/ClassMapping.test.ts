import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildModelStageTemplatePayload,
  buildRunningSessionPayload,
  buildTrainingClass
} from 'test/unit/factories'
import { bottle, flask } from 'test/unit/fixtures/annotation-class-payloads'

import ClassMapping from '@/components/DatasetSettings/ModelStage/ClassMapping.vue'
import { StageClassMapping } from '@/components/DatasetSettings/ModelStage/types'
import { installCommonComponents } from '@/plugins/components'
import {
  AnnotationClassPayload,
  ModelStageTemplatePayload,
  RunningSessionPayload
} from '@/store/types'

const localVue = createLocalVue()
installCommonComponents(localVue)
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let propsData: {
  annotationClasses: AnnotationClassPayload[]
  runningSession: RunningSessionPayload
  stage?: ModelStageTemplatePayload
  stageMapping?: StageClassMapping
}

const model = {
  item: 'class-mapping-item-stub',
  confirmButton: 'positive-button-stub',
  cancelButton: 'secondary-button-stub'
}

const itMatchesSnapshot = () => {
  it('matches snapshot', async () => {
    const wrapper = shallowMount(ClassMapping, { localVue, propsData, store })
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
}

const itEmitsCancel = () => {
  it('emits cancel', async () => {
    const wrapper = shallowMount(ClassMapping, { localVue, propsData, store })
    await wrapper.vm.$nextTick()
    await wrapper.find(model.cancelButton).vm.$emit('click')
    expect(wrapper.emitted().cancel!.length).toEqual(1)
  })
}

describe('when mapped pre-existing stage', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      annotationClasses: [bottle, flask],
      runningSession: buildRunningSessionPayload({
        id: 'bottletron',
        meta: {
          classes: [
            buildTrainingClass({ id: 'model-11', name: 'Bottle2', type: 'polygon' }),
            buildTrainingClass({ id: 'model-22', name: 'Flask2', type: 'polygon' }),
            buildTrainingClass({ id: 'model-33', name: 'Flask3', type: 'polygon' })
          ],
          num_instances_available: 1,
          num_instances_starting: 0
        }
      }),
      stage: buildModelStageTemplatePayload({
        id: 99,
        metadata: {}
      }),
      stageMapping: [
        { annotation_class_id: bottle.id, model_class_label: 'Bottle2' },
        { annotation_class_id: flask.id, model_class_label: 'Flask2' },
        { annotation_class_id: flask.id, model_class_label: 'Flask3' }
      ]
    }
  })

  itMatchesSnapshot()
  itEmitsCancel()

  it('preselects mapping', async () => {
    const wrapper = shallowMount(ClassMapping, { localVue, propsData, store })
    await wrapper.vm.$nextTick()
    const modelClasses = propsData.runningSession.meta.classes
    expect(wrapper.findAll(model.item).wrappers.map(w => w.props('mappedClass'))).toEqual([
      { annotationClass: bottle, modelClass: modelClasses[0] },
      { annotationClass: flask, modelClass: modelClasses[1] },
      { annotationClass: flask, modelClass: modelClasses[2] }
    ])
  })

  it('emits confirm', async () => {
    const wrapper = shallowMount(ClassMapping, { localVue, propsData, store })
    await wrapper.vm.$nextTick()
    await wrapper.find(model.confirmButton).vm.$emit('click')
    expect(wrapper.emitted().confirm![0][0]).toEqual([
      { annotationClass: bottle, modelClass: propsData.runningSession.meta.classes[0] },
      { annotationClass: flask, modelClass: propsData.runningSession.meta.classes[1] },
      { annotationClass: flask, modelClass: propsData.runningSession.meta.classes[2] }
    ])
  })
})

describe('when unmapped pre-existing stage', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      annotationClasses: [bottle, flask],
      runningSession: buildRunningSessionPayload({
        id: 'bottletron',
        meta: {
          classes: [
            buildTrainingClass({ id: 'model-11', name: 'Random', type: 'bounding_box' }),
            buildTrainingClass({ id: 'model-22', name: 'Random2', type: 'bounding_box' }),
            buildTrainingClass({ id: 'model-33', name: 'Random3', type: 'bounding_box' })
          ],
          num_instances_available: 1,
          num_instances_starting: 0
        }
      }),
      stage: buildModelStageTemplatePayload({ id: 99, metadata: {} }),
      stageMapping: []
    }
  })

  itMatchesSnapshot()
  itEmitsCancel()

  it('leaves classes unmapped', async () => {
    const wrapper = shallowMount(ClassMapping, { localVue, propsData, store })
    await wrapper.vm.$nextTick()

    const modelClasses = propsData.runningSession.meta.classes
    expect(wrapper.findAll(model.item).wrappers.map(w => w.props('mappedClass'))).toEqual([
      { annotationClass: null, modelClass: modelClasses[0] },
      { annotationClass: null, modelClass: modelClasses[1] },
      { annotationClass: null, modelClass: modelClasses[2] }
    ])
  })

  it('emits confirm', async () => {
    const wrapper = shallowMount(ClassMapping, { localVue, propsData, store })
    await wrapper.vm.$nextTick()
    await wrapper.find(model.confirmButton).vm.$emit('click')
    expect(wrapper.emitted().confirm![0][0]).toEqual([
      { annotationClass: null, modelClass: propsData.runningSession.meta.classes[0] },
      { annotationClass: null, modelClass: propsData.runningSession.meta.classes[1] },
      { annotationClass: null, modelClass: propsData.runningSession.meta.classes[2] }
    ])
  })
})

describe('when new stage', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      annotationClasses: [bottle, flask],
      runningSession: buildRunningSessionPayload({
        id: 'bottletron',
        meta: {
          classes: [
            buildTrainingClass({
              id: 'model-11',
              name: 'Random',
              display_name: flask.name,
              type: 'polygon'
            }),
            buildTrainingClass({
              id: 'model-22',
              name: 'Random2',
              display_name: flask.name,
              type: 'polygon'
            }),
            buildTrainingClass({
              id: 'model-33',
              name: 'Random3',
              display_name: flask.name,
              type: 'polygon'
            })
          ],
          num_instances_available: 1,
          num_instances_starting: 0
        }
      }),
      // -1 makes the stage new
      stage: buildModelStageTemplatePayload({ id: -1, metadata: {} }),
      stageMapping: []
    }
  })

  itMatchesSnapshot()
  itEmitsCancel()

  it('attempts to automap classes', async () => {
    const wrapper = shallowMount(ClassMapping, { localVue, propsData, store })
    await wrapper.vm.$nextTick()

    const modelClasses = propsData.runningSession.meta.classes
    expect(wrapper.findAll(model.item).wrappers.map(w => w.props('mappedClass'))).toEqual([
      { annotationClass: flask, modelClass: modelClasses[0] },
      { annotationClass: flask, modelClass: modelClasses[1] },
      { annotationClass: flask, modelClass: modelClasses[2] }
    ])
  })

  it('emits confirm', async () => {
    const wrapper = shallowMount(ClassMapping, { localVue, propsData, store })
    await wrapper.vm.$nextTick()
    await wrapper.find(model.confirmButton).vm.$emit('click')
    expect(wrapper.emitted().confirm![0][0]).toEqual([
      { annotationClass: flask, modelClass: propsData.runningSession.meta.classes[0] },
      { annotationClass: flask, modelClass: propsData.runningSession.meta.classes[1] },
      { annotationClass: flask, modelClass: propsData.runningSession.meta.classes[2] }
    ])
  })

  it('does not attempt to automap again, on subsequent opens', async () => {
    // setting this emulates a scenario where class mapping was already open once
    // and mapping was set
    propsData.stageMapping = [
      { annotation_class_id: bottle.id, model_class_label: 'Random' }
    ]
    const wrapper = shallowMount(ClassMapping, { localVue, propsData, store })
    await wrapper.vm.$nextTick()

    const modelClasses = propsData.runningSession.meta.classes
    expect(wrapper.findAll(model.item).wrappers.map(w => w.props('mappedClass'))).toEqual([
      { annotationClass: bottle, modelClass: modelClasses[0] },
      { annotationClass: null, modelClass: modelClasses[1] },
      { annotationClass: null, modelClass: modelClasses[2] }
    ])
  })
})

describe('when no stage and no mapping', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      annotationClasses: [bottle, flask],
      runningSession: buildRunningSessionPayload({
        id: 'bottletron',
        meta: {
          classes: [
            buildTrainingClass({
              id: 'model-11',
              name: 'Random',
              display_name: flask.name,
              type: 'polygon'
            }),
            buildTrainingClass({
              id: 'model-22',
              name: 'Random2',
              display_name: flask.name,
              type: 'polygon'
            }),
            buildTrainingClass({
              id: 'model-33',
              name: 'Random3',
              display_name: flask.name,
              type: 'polygon'
            })
          ],
          num_instances_available: 1,
          num_instances_starting: 0
        }
      })
    }
  })

  itMatchesSnapshot()
  itEmitsCancel()
})

describe('when no stage, but pre-existing mapping', () => {
  beforeEach(() => {
    store = createTestStore()
    store.commit('workview/SET_AUTO_ANNOTATE_CLASS_MAPPING', {
      runningSessionId: 'bottletron',
      classMapping: [
        {
          annotationClassId: 4,
          modelClassLabel: 'Random'
        },
        {
          annotationClassId: 5,
          modelClassLabel: 'Random2'
        }
      ]
    })
    propsData = {
      annotationClasses: [bottle, flask],
      runningSession: buildRunningSessionPayload({
        id: 'bottletron',
        meta: {
          classes: [
            buildTrainingClass({
              id: 'model-11',
              name: 'Random',
              display_name: flask.name,
              type: 'polygon'
            }),
            buildTrainingClass({
              id: 'model-22',
              name: 'Random2',
              display_name: flask.name,
              type: 'polygon'
            }),
            buildTrainingClass({
              id: 'model-33',
              name: 'Random3',
              display_name: flask.name,
              type: 'polygon'
            })
          ],
          num_instances_available: 1,
          num_instances_starting: 0
        }
      })
    }
  })

  itMatchesSnapshot()
  itEmitsCancel()

  it('emits confirm', async () => {
    const wrapper = shallowMount(ClassMapping, { localVue, propsData, store })
    await wrapper.vm.$nextTick()
    await wrapper.find(model.confirmButton).vm.$emit('click')
    expect(wrapper.emitted().confirm![0][0]).toEqual([
      { annotationClass: flask, modelClass: propsData.runningSession.meta.classes[0] },
      { annotationClass: bottle, modelClass: propsData.runningSession.meta.classes[1] },
      { annotationClass: null, modelClass: propsData.runningSession.meta.classes[2] }
    ])
  })
})
