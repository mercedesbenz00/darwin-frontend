import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore, { setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotationClassImagePayload,
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildTeamPayload
} from 'test/unit/factories'

import AnnotationClassDialog from '@/components/Classes/AnnotationClassDialog/AnnotationClassDialog.vue'
import { PendingClassImage } from '@/components/Classes/AnnotationClassDialog/types'
import { installCommonComponents } from '@/plugins/components'
import { createAnnotationClass } from '@/store/modules/aclass/actions/createAnnotationClass'
import { updateAnnotationClass } from '@/store/modules/aclass/actions/updateAnnotationClass'
import {
  AnnotationClassPayload,
  AnnotationTypeName,
  DatasetPayload,
  SkeletonMetadata,
  StoreActionPayload,
  TeamPayload
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(VModal)
localVue.use(Vuex)
installCommonComponents(localVue)

const annotationClasses = [
  buildAnnotationClassPayload({ id: 1, name: 'square', annotation_types: ['bounding_box'] }),
  buildAnnotationClassPayload({ id: 2, name: 'bottle', annotation_types: ['polygon'] }),
  buildAnnotationClassPayload({ id: 3, name: 'blurry', annotation_types: ['tag'] })
]

let propsData: {
  annotationClasses: AnnotationClassPayload[]
  dataset?: DatasetPayload
  team: TeamPayload
}

let mocks: { $featureEnabled: Function }

let store: ReturnType<typeof createTestStore>

let randomSpy: jest.SpyInstance

const team = buildTeamPayload({ id: 1 })

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get component () {
    return this.wrapper.vm as unknown as {
      show: (data?: AnnotationClassPayload) => Promise<void>
      $refs: Record<string, Record<string, Function>>
    }
  }

  stubRefs () {
    this.component.$refs = {
      content: {
        scrollTo: jest.fn()
      }
    }
  }

  async show (data?: AnnotationClassPayload) {
    await this.component.show(data)
    await flushPromises()
  }

  get name () {
    return this.wrapper.find('input-field-stub')
  }

  setName (value: string = 'Test') {
    return this.name.vm.$emit('input', value)
  }

  get color () {
    return this.wrapper.find('class-color-stub')
  }

  setColor (value: string = 'rgba(0, 0, 0, 1)') {
    return this.color.vm.$emit('update:color', value)
  }

  get hotkey () {
    return this.wrapper.find('hotkey-input-stub')
  }

  setHotkey (value: string) {
    return this.hotkey.vm.$emit('update:hotkey', value)
  }

  get mainTypeSelect () {
    return this.wrapper.find('annotation-type-select-stub')
  }

  selectMainType (type: AnnotationTypeName) {
    return this.mainTypeSelect.vm.$emit('update:selected-annotation-type', type)
  }

  get subTypeSelect () {
    return this.wrapper.find('annotation-sub-type-select-stub')
  }

  selectSubTypes (value: Partial<Record<AnnotationTypeName, boolean>>) {
    return this.subTypeSelect.vm.$emit('update:type-selections', value)
  }

  get skeletonEditor () {
    return this.wrapper.find('skeleton-editor-stub')
  }

  setSkeleton (data: SkeletonMetadata) {
    this.skeletonEditor.vm.$emit('change', data)
  }

  get description () {
    return this.wrapper.find('description-stub')
  }

  setDescription (value: string) {
    return this.description.vm.$emit('update:description', value)
  }

  get images () {
    return this.wrapper.find('class-thumbnails-stub')
  }

  setImages (value: PendingClassImage[]) {
    return this.images.vm.$emit('update:images', value)
  }

  get saveButton () {
    return this.wrapper.find('positive-button-stub')
  }

  save () {
    return this.saveButton.vm.$emit('click')
  }

  hitEnter () {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
  }
}

beforeEach(() => {
  propsData = { annotationClasses, team }
  mocks = { $featureEnabled: jest.fn().mockReturnValue(false) }
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  store.commit('features/SET_FEATURES', [])
  store.dispatch = jest.fn().mockImplementation(
    (
      action,
      params:
        | StoreActionPayload<typeof createAnnotationClass>
        | StoreActionPayload<typeof updateAnnotationClass>
    ) => {
      if (action === 'admin/indexTeamFeatures') {
        return Promise.resolve({ data: [] })
      }
      if (action === 'aclass/createAnnotationClass') {
        return Promise.resolve({ data: { ...params, id: 1 } })
      }

      if (action === 'aclass/updateAnnotationClass') {
        return Promise.resolve({ data: params })
      }

      return Promise.resolve({ data: {} })
    })

  randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0)
})

afterEach(() => randomSpy.mockClear())

it('matches snapshot', () => {
  const wrapper = shallowMount(AnnotationClassDialog, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when the save button is disabled because no annotation type selected', async () => {
  const wrapper = shallowMount(AnnotationClassDialog, { localVue, mocks, propsData, store })
  const model = new Model(wrapper)
  await model.stubRefs()
  await model.setName('Test')
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
})

it('renders skeleton section if skeleton type', async () => {
  const wrapper = shallowMount(AnnotationClassDialog, { localVue, mocks, propsData, store })
  const model = new Model(wrapper)
  await model.stubRefs()
  await wrapper.setData({ selectedMainAnnotationType: 'skeleton' })

  expect(wrapper).toMatchSnapshot()
  expect(model.skeletonEditor.exists()).toBe(true)
})

it('can save a new annotation class', async () => {
  const wrapper = shallowMount(AnnotationClassDialog, { localVue, mocks, propsData, store })
  const model = new Model(wrapper)
  await model.stubRefs()
  await model.show()
  await model.setName('Test')
  await model.setColor('rgba(0, 0, 0, 1)')
  await model.selectMainType('polygon')
  await model.selectSubTypes({
    attributes: true,
    directional_vector: true
  })
  await model.setDescription('Test Description')
  await model.setImages([
    buildAnnotationClassImagePayload({ key: 'foo', crop_key: 'bar' })
  ])
  await model.save()

  await flushPromises()

  const expected: StoreActionPayload<typeof createAnnotationClass> = {
    annotationTypeNames: ['polygon', 'attributes', 'directional_vector'],
    datasets: [],
    description: 'Test Description',
    images: [expect.anything()],
    metadata: { _color: 'rgba(0, 0, 0, 1)', skeleton: undefined },
    name: 'Test'
  }
  expect(store.dispatch).toHaveBeenCalledWith('aclass/createAnnotationClass', expected)

  expect(wrapper.emitted().add!.length).toBe(1)
})

it('can save a new skeleton class', async () => {
  const wrapper = shallowMount(AnnotationClassDialog, { localVue, mocks, propsData, store })
  const model = new Model(wrapper)
  await model.stubRefs()
  await model.show()
  await model.setName('Test')
  await model.setColor('rgba(0, 0, 0, 1)')
  await model.selectMainType('skeleton')
  await model.setDescription('Test Description')
  await model.setSkeleton({
    nodes: [{ name: 'a', x: 1, y: 2 }, { name: 'b', x: 10, y: 20 }],
    edges: [{ from: 'a', to: 'b' }]
  })
  await model.save()

  await flushPromises()

  const expected: StoreActionPayload<typeof createAnnotationClass> = {
    annotationTypeNames: ['skeleton'],
    datasets: [],
    description: 'Test Description',
    images: [],
    metadata: {
      _color: 'rgba(0, 0, 0, 1)',
      skeleton: {
        nodes: [{ name: 'a', x: 1, y: 2 }, { name: 'b', x: 10, y: 20 }],
        edges: [{ from: 'a', to: 'b' }]
      }
    },
    name: 'Test'
  }
  expect(store.dispatch).toHaveBeenCalledWith('aclass/createAnnotationClass', expected)

  expect(wrapper.emitted().add!.length).toBe(1)
})

it('can save a new imageless annotation class', async () => {
  const wrapper = shallowMount(AnnotationClassDialog, { localVue, mocks, propsData, store })
  const model = new Model(wrapper)
  await model.stubRefs()
  await model.show()
  await model.setName('Test')
  await model.selectMainType('polygon')
  await model.selectSubTypes({
    attributes: true,
    directional_vector: true
  })
  await model.save()

  await flushPromises()

  const expected: StoreActionPayload<typeof createAnnotationClass> = {
    annotationTypeNames: ['polygon', 'attributes', 'directional_vector'],
    datasets: [],
    description: null,
    images: [],
    metadata: { _color: 'rgba(255,73,73,1.0)', skeleton: undefined },
    name: 'Test'
  }
  expect(store.dispatch).toHaveBeenCalledWith('aclass/createAnnotationClass', expected)

  expect(wrapper.emitted().add!.length).toBe(1)
})

it('can save an existing annotation class', async () => {
  const wrapper = shallowMount(AnnotationClassDialog, { localVue, mocks, propsData, store })
  const model = new Model(wrapper)
  await model.stubRefs()

  await model.show(buildAnnotationClassPayload({
    id: 2,
    name: 'Existing class',
    description: 'Existing description',
    annotation_types: ['bounding_box'],
    images: [],
    metadata: { _color: 'rgba(255,222,111,1.0)' }
  }))

  await flushPromises()

  await model.setName('Updated class')
  await model.setColor('rgba(0,0,0,1)')
  await model.selectMainType('polygon')
  await model.setDescription('Updated Description')
  await model.save()

  await flushPromises()

  const expected: StoreActionPayload<typeof updateAnnotationClass> = {
    annotationTypeNames: ['polygon'],
    description: 'Updated Description',
    id: 2,
    images: [],
    metadata: { _color: 'rgba(0,0,0,1)' },
    name: 'Updated class',
    datasets: []
  }
  expect(store.dispatch).toHaveBeenCalledWith('aclass/updateAnnotationClass', expected)
  expect(wrapper.emitted().update).toBeDefined()
})

it('when editing an existing class, correctly sets original subtypes', async () => {
  const wrapper = shallowMount(AnnotationClassDialog, { localVue, mocks, propsData, store })
  const model = new Model(wrapper)
  await model.stubRefs()

  await model.show(buildAnnotationClassPayload({
    id: 2,
    name: 'Existing class',
    description: 'Existing description',
    annotation_types: ['bounding_box', 'text', 'attributes'],
    images: [],
    metadata: { _color: 'rgba(255,222,111,1.0)' }
  }))

  await flushPromises()

  const expected: Partial<Record<AnnotationTypeName, boolean>> = {
    attributes: true,
    auto_annotate: false,
    directional_vector: false,
    inference: false,
    instance_id: false,
    measures: false,
    text: true
  }
  expect(model.subTypeSelect.props('originalSubTypeSelections')).toEqual(expected)
})

it('quick adds when you press on enter', async () => {
  const wrapper = shallowMount(AnnotationClassDialog, { localVue, mocks, propsData, store })
  const model = new Model(wrapper)
  await model.stubRefs()
  await model.show()
  await model.setName('Test')
  await model.setColor('rgba(0,0,0,1)')
  await model.selectMainType('polygon')
  await model.hitEnter()
  await flushPromises()

  const expected: StoreActionPayload<typeof createAnnotationClass> = {
    annotationTypeNames: ['polygon'],
    datasets: [],
    description: null,
    images: [],
    metadata: { _color: 'rgba(0,0,0,1)', skeleton: undefined },
    name: 'Test'
  }
  expect(store.dispatch).toHaveBeenCalledWith('aclass/createAnnotationClass', expected)

  expect(wrapper.emitted().add).toBeDefined()
})

it('saves a new hotkey when the new class is being created', async () => {
  propsData.dataset = buildDatasetPayload({ annotation_hotkeys: { } })
  const wrapper = shallowMount(AnnotationClassDialog, { localVue, mocks, propsData, store })
  const model = new Model(wrapper)

  await model.stubRefs()
  await model.show()
  await model.setName('Test')
  await model.setColor('rgba(0,0,0,1)')
  await model.setHotkey('1')
  await model.selectMainType('polygon')
  await model.save()
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith(
    'dataset/updateDataset',
    expect.objectContaining({
      params: expect.objectContaining({
        annotationHotkeys: { 1: 'select_class:1' }
      })
    })
  )

  expect(store.dispatch).toHaveBeenCalledWith(
    'toast/notify',
    { content: 'Test hotkey set to 1' }
  )
})

it('saves a new hotkey when it is set', async () => {
  propsData.dataset = buildDatasetPayload({ })
  const wrapper = shallowMount(AnnotationClassDialog, { localVue, mocks, propsData, store })
  const model = new Model(wrapper)

  await model.stubRefs()
  await model.show(annotationClasses[1])
  await model.setHotkey('2')
  await model.save()

  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith(
    'dataset/updateDataset',
    expect.objectContaining({
      params: expect.objectContaining({
        annotationHotkeys: { 2: `select_class:${annotationClasses[1].id}` }
      })
    })
  )

  expect(store.dispatch).toHaveBeenCalledWith(
    'toast/notify',
    { content: 'bottle hotkey set to 2' }
  )
})

it('saves a new hotkey and unbounds existing hotkey when it is set', async () => {
  propsData.dataset = buildDatasetPayload({
    annotation_hotkeys: { 2: `select_class:${annotationClasses[0].id}` }
  })

  const wrapper = shallowMount(AnnotationClassDialog, { localVue, mocks, propsData, store })

  const model = new Model(wrapper)
  await model.stubRefs()
  await model.show(annotationClasses[1])
  await model.setHotkey('2')
  await model.save()
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith(
    'dataset/updateDataset',
    expect.objectContaining({
      params: expect.objectContaining({
        annotationHotkeys: { 2: `select_class:${annotationClasses[1].id}` }
      })
    })
  )

  expect(store.dispatch).toHaveBeenCalledWith(
    'toast/notify',
    { content: 'bottle hotkey set to 2' }
  )

  expect(store.dispatch).toHaveBeenCalledWith(
    'toast/notify',
    { content: 'square hotkey has been unbound' }
  )
})
