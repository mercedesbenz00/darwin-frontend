import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotation,
  buildAnnotationClassPayload,
  buildDatasetImagePayload,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildDatasetVideoPayload,
  buildImagePayload,
  buildLoadedFrame,
  buildLoadedVideo,
  buildMeasureRegionsPayload,
  buildMembershipPayload,
  buildModelTemplatePayload,
  buildRunningSessionPayload,
  buildTeamPayload,
  buildTrainedModelPayload,
  buildUserPayload
} from 'test/unit/factories'

import { connectStore } from '@/engine/connectStore'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation, Layout } from '@/engine/models'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import {
  DatasetItemPayload,
  MembershipPayload,
  ModelType,
  TeamPayload,
  UserPayload
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let bottleAnnotationClass: AnnotationClass
let flaskAnnotationClass: AnnotationClass
let tagAnnotationClass: AnnotationClass
let sam: UserPayload
let samMember: MembershipPayload
let v7: TeamPayload

let editor: Editor

let unsavedPolygon: Annotation
let savedPolygon: Annotation

const sfh = buildDatasetPayload({ id: 1 })

const initEditor = (store: ReturnType<typeof createTestStore>): Editor => {
  const editor = new Editor(new ItemManager(store), store)
  document.body.appendChild(editor.viewsList[0].mainLayer.canvas)
  jest.spyOn(editor.camera, 'scaleToFit').mockReturnValue(undefined)
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
  editor.activeView.setAnnotationClasses(store.state.aclass.classes)
  connectStore(store, editor)
  return editor
}

const bottle = buildAnnotationClassPayload({
  id: 1,
  name: 'bottle',
  annotation_types: ['polygon'],
  datasets: [{ id: sfh.id }]
})

const flask = buildAnnotationClassPayload({
  id: 2,
  name: 'flask',
  annotation_types: ['polygon'],
  datasets: [{ id: sfh.id }]
})

const tag = buildAnnotationClassPayload({
  id: 3,
  name: 'tag',
  annotation_types: ['tag'],
  datasets: [{ id: sfh.id }]
})

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)

  store.commit('aclass/SET_CLASSES', [bottle, flask, tag])
  store.commit('workview/SET_DATASET', sfh)

  sam = buildUserPayload({ id: 75 })
  store.commit('user/SET_PROFILE', sam)

  v7 = buildTeamPayload({ id: 1 })
  store.commit('team/SET_CURRENT_TEAM', v7)

  samMember = buildMembershipPayload({ id: 998, user_id: sam.id, team_id: v7.id })
  store.commit('team/SET_MEMBERSHIPS', [samMember])

  editor = initEditor(store)

  bottleAnnotationClass = editor.activeView.annotationClasses.find(c => c.name === 'bottle')!
  flaskAnnotationClass = editor.activeView.annotationClasses.find(c => c.name === 'flask')!
  tagAnnotationClass = editor.activeView.annotationClasses.find(c => c.name === 'tag')!

  unsavedPolygon = Annotation.createFromInstanceParams(editor.activeView, {
    type: 'polygon',
    classId: 5,
    data: { path: [{ x: 1, y: 2 }, { x: 2, y: 3 }] },
    actors: [],
    isSelected: false,
    isVisible: true,
    isHighlighted: false,
    zIndex: 1
  })!

  savedPolygon = unsavedPolygon.shallowClone()
  savedPolygon.id = 'fake-id'
})

afterEach(() => {
  jest.clearAllMocks()
})

it('editors constructor should set layout by default', () => {
  expect(editor.layout.layoutConfig).toEqual({
    type: 'single',
    views: [{
      item: store.state.workview.selectedDatasetItem
    }]
  })
})

it('editors plugins should to be reinstalled when layout is updated', () => {
  jest.spyOn(editor.pluginManager, 'installAll')
  const plugins = editor.pluginManager.installedPlugins
  editor.setupLayout({
    type: 'grid',
    views: [{
      item: null,
      framesGroup: [1]
    }, {
      item: null,
      framesGroup: [2]
    }, {
      item: null,
      framesGroup: [3]
    }, {
      item: null,
      framesGroup: [4]
    }]
  })

  expect(editor.pluginManager.installAll).toHaveBeenCalledWith(
    plugins
  )
})

it('setItem should trigger layouts item update', () => {
  jest.spyOn(Layout.prototype, 'setViewConfig')

  editor.setItem(null)

  expect(Layout.prototype.setViewConfig).toHaveBeenCalledWith(
    expect.any(String),
    {
      item: null,
      framesGroup: null
    }
  )
})

it('tracks activity in store on action manager "action" event', () => {
  editor.actionManager.emit('action')
  expect(store.dispatch).toHaveBeenCalledWith('workviewTracker/reportActivity')
})

describe('deactivateToolOption', () => {
  beforeEach(() => {
    const plugins = editor.pluginManager.pluginsForDataset(sfh, [])
    editor.installAllPlugins(plugins)
  })

  it('returns without error when no current tool', () => {
    expect(editor.toolManager.currentTool).toBeNull()
    editor.deactivateToolOption('option')
    expect(true).toBeTruthy()
  })

  it('returns without error when no current tool options', () => {
    expect(editor.toolManager.currentTool).toBeNull()
    editor.toolManager.activateTool('magnifier_glass')
    expect(editor.toolManager.currentTool).toBeDefined()
    editor.deactivateToolOption('option')
    expect(true).toBeTruthy()
  })

  it('returns when there is no matching tool option id', () => {
    editor.toolManager.activateTool('edit_tool')
    expect(editor.toolManager.currentTool).toBeDefined()
    expect(editor.toolManager.currentTool!.toolConfig.toolOptions).toBeDefined()
    expect(editor.toolManager.currentTool!.toolConfig.toolOptions!.length).toBeGreaterThan(0)
    editor.deactivateToolOption('random tool option')
    expect(true).toBeTruthy()
  })

  it('sets active as false when there is matching active tool option id', () => {
    editor.toolManager.activateTool('edit_tool')
    expect(editor.toolManager.currentTool).toBeDefined()
    expect(editor.toolManager.currentTool!.toolConfig.toolOptions).toBeDefined()
    expect(editor.toolManager.currentTool!.toolConfig.toolOptions!.length).toBeGreaterThan(0)

    const toolOption1 = editor.toolManager.currentTool!.toolConfig.toolOptions![0]
    toolOption1.active = true
    editor.deactivateToolOption(toolOption1.id)
    expect(toolOption1.active).toBeFalsy()
  })
})

describe('deactivateToolOptions', () => {
  beforeEach(() => {
    const plugins = editor.pluginManager.pluginsForDataset(sfh, [])
    editor.installAllPlugins(plugins)
  })

  it('returns without error when no current tool', () => {
    expect(editor.toolManager.currentTool).toBeNull()
    editor.deactivateToolOptions()
    expect(true).toBeTruthy()
  })

  it('deactivate all the tool options', () => {
    editor.toolManager.activateTool('edit_tool')
    expect(editor.toolManager.currentTool).toBeDefined()
    expect(editor.toolManager.currentTool!.toolConfig.toolOptions).toBeDefined()
    expect(editor.toolManager.currentTool!.toolConfig.toolOptions!.length).toBeGreaterThan(0)

    editor.deactivateToolOptions()

    editor.toolManager.currentTool!.toolConfig.toolOptions!.forEach((option) => {
      expect(option.active).toBeFalsy()
    })
  })
})

describe('setImage', () => {
  const itemBefore = buildDatasetItemPayload({
    id: 1,
    dataset_image: buildDatasetImagePayload({
      id: 1,
      image: buildImagePayload({ id: 1 })
    })
  })

  const datasetImage = itemBefore.dataset_image!

  beforeEach(() => {
    store = createTestStore()
    store.commit('workview/SET_SELECTED_DATASET_ITEM', itemBefore)

    editor = initEditor(store)

    editor.loadedImage = {
      cache: {},
      data: {
        data: new Image(),
        rawData: null,
        transformedData: null,
        lastWindowLevels: [1, 255],
        lastColorMap: 'default'
      },
      datasetImageId: datasetImage.id,
      format: datasetImage.image.format,
      height: datasetImage.image.height,
      id: datasetImage.image.id,
      levels: datasetImage.image.levels,
      originalFilename: datasetImage.image.original_filename,
      taskId: null,
      thumbnailURL: datasetImage.image.thumbnail_url,
      url: datasetImage.image.url,
      width: datasetImage.image.width
    }

    editor.toolManager.activateTool('zoom_tool')
    editor.toolManager.currentTool!.tool.reset = jest.fn()

    const dispatch = store.dispatch as jest.Mock
    dispatch.mockClear()
  })

  describe('when switching images', () => {
    const itemAfter = buildDatasetItemPayload({
      id: 2,
      dataset_image: buildDatasetImagePayload({
        id: 2,
        image: buildImagePayload({ id: 2 })
      })
    })

    it('resets tool', () => {
      store.commit('workview/SET_SELECTED_DATASET_ITEM', itemAfter)
      expect(editor.toolManager.currentTool!.tool.reset).toHaveBeenCalled()
    })

    it('dispatches image load', () => {
      store.commit('workview/SET_SELECTED_DATASET_ITEM', itemAfter)
      expect(store.dispatch).toHaveBeenCalledWith('workview/loadItem', itemAfter)
    })
  })

  describe('when self-assigning current image', () => {
    const itemAfter = buildDatasetItemPayload({
      id: 1,
      dataset_image: buildDatasetImagePayload({
        id: 1,
        image: buildImagePayload({ id: 1 })
      })
    })

    it('does not dispatch image load', () => {
      store.commit('workview/SET_SELECTED_DATASET_ITEM', itemAfter)
      expect(store.dispatch).not.toHaveBeenCalledWith('workview/loadItem', itemAfter)
    })
  })

  describe('when first setting image', () => {
    beforeEach(() => {
      store = createTestStore()
      editor = initEditor(store)

      editor.toolManager.activateTool('zoom_tool')
      editor.toolManager.currentTool!.tool.reset = jest.fn()

      const dispatch = store.dispatch as jest.Mock
      dispatch.mockClear()
    })

    it('resets tool', () => {
      store.commit('workview/SET_SELECTED_DATASET_ITEM', itemBefore)
      expect(editor.toolManager.currentTool!.tool.reset).toHaveBeenCalled()
    })

    it('dispatches image load', () => {
      store.commit('workview/SET_SELECTED_DATASET_ITEM', itemBefore)
      expect(store.dispatch).toHaveBeenCalledWith('workview/loadItem', itemBefore)
    })
  })
})

// Initial implementation of drawHistogram and clearHistogram tests used an
// actual canvas, with a mock context.
// This somehow interfered with other tests in this module, so we opted to
// mock the entire canvas.

describe('clickerEpsilon value change', () => {
  beforeEach(() => {
    jest.spyOn(editor, 'callCommand').mockReturnValue(undefined)
  })

  it('triggers clicker tool recaculation', () => {
    store.commit('workview/SET_CLICKER_EPSILON', 0.5)
    expect(editor.callCommand).toBeCalledWith('clicker_tool.apply_clicker_epsilon')
  })
})

describe('repaint', () => {
  const { requestAnimationFrame } = window
  beforeEach(() => {
    window.requestAnimationFrame = jest.fn().mockImplementation(cb => cb())
  })

  afterEach(() => {
    window.requestAnimationFrame = requestAnimationFrame
  })

  const img = (w: number, h: number) => {
    const img = document.createElement('img')
    img.height = h
    img.width = w
    return img
  }

  it('renders raw image', () => {
    const imageItem = editor.activeView.mainLayer.getItem('image')

    editor.activeView.rawImage = img(100, 100)
    editor.activeView.loadedImage = null
    editor.activeView.loadedVideo = null

    jest.spyOn(editor.activeView.renderManager, 'renderRaw').mockImplementation(() => null)
    jest.spyOn(imageItem, 'render')

    editor.activeView.mainLayer.changed()

    editor.activeView.render()

    expect(editor.activeView.renderManager.renderRaw).toHaveBeenCalled()
    expect(imageItem.render).toHaveBeenCalled()
  })
})

describe('maybeChangeSelectedAnnotationClass', () => {
  let bottleAnnotation: Annotation
  let flaskAnnotation: Annotation
  let tagAnnotation: Annotation

  beforeEach(() => {
    store.commit('workview/SET_DATASET', sfh)
    bottleAnnotation = buildAnnotation(editor, { classId: bottleAnnotationClass.id, isVisible: true, type: 'polygon' })!
    flaskAnnotation = buildAnnotation(editor, { classId: flaskAnnotationClass.id, isVisible: true, type: 'polygon' })!
    tagAnnotation = buildAnnotation(editor, { classId: tagAnnotationClass.id, isVisible: true, type: 'tag' })!
    jest.spyOn(editor.activeView.annotationManager, 'annotations', 'get').mockReturnValue([
      bottleAnnotation,
      flaskAnnotation,
      tagAnnotation
    ])
  })

  it('change annotation class to bottle if the flask annotation is selected', () => {
    jest.spyOn(editor.actionManager, 'do').mockResolvedValue(undefined)
    flaskAnnotation.select(false)
    expect(editor.maybeChangeSelectedAnnotationClass(bottleAnnotationClass)).toBeTruthy()
    expect(editor.actionManager.do).toBeCalled()
  })

  it('never change annotation class to flask if the flask annotation is selected', () => {
    jest.spyOn(editor.actionManager, 'do').mockResolvedValue(undefined)
    flaskAnnotation.select(false)
    expect(editor.maybeChangeSelectedAnnotationClass(flaskAnnotationClass)).toBeFalsy()
    expect(editor.actionManager.do).not.toBeCalled()
  })

  it('never change to other annotation class if the tag annotation is selected', () => {
    jest.spyOn(editor.actionManager, 'do').mockResolvedValue(undefined)
    tagAnnotation.select(false)
    const otherTagAnnotationClass = new AnnotationClass({ ...tag, id: 2 })
    expect(editor.maybeChangeSelectedAnnotationClass(otherTagAnnotationClass)).toBeFalsy()
    expect(editor.actionManager.do).not.toBeCalled()
  })
})

describe('linkStore', () => {
  let item: DatasetItemPayload

  beforeEach(() => {
    const datasetImage = buildDatasetImagePayload({ id: 21 })
    item = buildDatasetItemPayload({ id: 19, dataset_image_id: 21, dataset_image: datasetImage })
  })

  describe('workview/SET_SELECTED_DATASET_ITEM', () => {
    it('resets current item and annotations if it is not same as current one', async () => {
      jest.spyOn(editor.activeView, 'setItem').mockResolvedValue()
      jest.spyOn(editor.activeView.annotationManager, 'setAnnotations').mockReturnValue(undefined)
      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
      await flushPromises()
      expect(editor.activeView.setItem).toBeCalled()
    })

    it('keep the current item and annotations if it is same as current item', async () => {
      jest.spyOn(editor.activeView, 'setItem').mockResolvedValue()
      jest.spyOn(editor.activeView.annotationManager, 'setAnnotations').mockReturnValue(undefined)
      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
      await flushPromises()
      expect(editor.activeView.setItem).toBeCalled()
      expect(editor.activeView.annotationManager.setAnnotations).toBeCalledWith([])
    })
  })
})

describe('disableAnnotationOverlays', () => {
  it('sets annotation overlay disabled status to true', () => {
    editor.disableAnnotationOverlays()
    expect(store.state.workview.annotationOverlayDisabled).toBeTruthy()
  })
})

describe('enableAnnotationOverlays', () => {
  it('sets annotation overlay disabled status to false', () => {
    editor.enableAnnotationOverlays()
    expect(store.state.workview.annotationOverlayDisabled).toBeFalsy()
  })
})

describe('measureRegion', () => {
  it('returns measure region if it is in the video metadata', () => {
    const measureRegions = [buildMeasureRegionsPayload()]
    jest.spyOn(editor.activeView, 'currentItem', 'get')
      .mockReturnValue(buildDatasetItemPayload({
        dataset_video: buildDatasetVideoPayload({
          width: 100,
          height: 200,
          metadata: { measure_regions: measureRegions, type: 'video' }
        })
      }))
    expect(editor.measureRegion).toEqual(measureRegions[0])
  })

  it('returns image bounding area if no measure region data found', () => {
    jest.spyOn(editor.activeView, 'currentItem', 'get')
      .mockReturnValue(buildDatasetItemPayload({
        dataset_image: buildDatasetImagePayload({
          image: buildImagePayload({ width: 100, height: 200 })
        })
      }))
    expect(editor.measureRegion).toEqual({
      delta: { x: 1, y: 1 },
      high_priority: true,
      unit: { x: 'px', y: 'px' },
      x: 0,
      y: 0,
      w: 100,
      h: 200
    })
  })

  it('returns video bounding area if no measure region data found', () => {
    jest.spyOn(editor.activeView, 'currentItem', 'get')
      .mockReturnValue(buildDatasetItemPayload({
        dataset_video: buildDatasetVideoPayload({ width: 100, height: 200, metadata: undefined })
      }))
    expect(editor.measureRegion).toEqual({
      delta: { x: 1, y: 1 },
      high_priority: true,
      unit: { x: 'px', y: 'px' },
      x: 0,
      y: 0,
      w: 100,
      h: 200
    })
  })
})

describe('isFrameIndexValid', () => {
  beforeEach(() => {
    editor.loadedVideo = buildLoadedVideo({
      frames: {
        0: buildLoadedFrame({ seq: 1 }),
        1: buildLoadedFrame({ seq: 2 }),
        2: buildLoadedFrame({ seq: 3 }),
        3: buildLoadedFrame({ seq: 4 }),
        4: buildLoadedFrame({ seq: 5 })
      }
    })
  })

  it('returns true if frameIndex is in the loadedVideo\'s frame index range', () => {
    expect(editor.isFrameIndexValid(0)).toBeTruthy()
    expect(editor.isFrameIndexValid(1)).toBeTruthy()
    expect(editor.isFrameIndexValid(2)).toBeTruthy()
    expect(editor.isFrameIndexValid(3)).toBeTruthy()
    expect(editor.isFrameIndexValid(4)).toBeTruthy()
    expect(editor.isFrameIndexValid(5)).toBeFalsy()
  })
})

describe('imageSmoothing', () => {
  beforeEach(() => {
    store.commit('workview/SET_DATASET', sfh)
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('get user-preferred value for file extension if exists', () => {
    editor.setItem(buildDatasetItemPayload({
      id: 1,
      filename: 'image.jpg'
    }))

    window.localStorage.setItem('isImageSmoothing:jpg', 'off')
    expect(editor.activeView.defaultImageSmoothing).toBeFalsy()
    window.localStorage.setItem('isImageSmoothing:jpg', 'on')
    expect(editor.activeView.defaultImageSmoothing).toBeTruthy()
  })

  it('should get default value for file extensions [dicom, svs, pdf, tiff] if user-preferred value does not exists', () => {
    editor.setItem(buildDatasetItemPayload({
      id: 1,
      filename: 'test.dicom'
    }))

    expect(editor.activeView.defaultImageSmoothing).toBeTruthy()
  })

  it('should get default value for file extension *.dcm if user-preferred value does not exists', () => {
    editor.setItem(buildDatasetItemPayload({
      id: 1,
      filename: 'test.dcm'
    }))

    expect(editor.activeView.defaultImageSmoothing).toBeTruthy()
  })

  it('should get default value for file extensions different from [dicom, svs, pdf, tiff] if user-preferred value does not exists', () => {
    editor.setItem(buildDatasetItemPayload({
      id: 1,
      filename: 'test.png'
    }))

    expect(editor.activeView.defaultImageSmoothing).toBeFalsy()
  })
})

describe('preselectedModelClassMapping', () => {
  it('returns empty array if no preselected model', () => {
    expect(editor.preselectedModelClassMapping).toEqual([])
  })

  it('returns empty array if preselected model, but not mapped', () => {
    const trainedModel = buildTrainedModelPayload()
    store.state.neuralModel.trainedModels = [trainedModel]

    const autoAnnotateModel = buildRunningSessionPayload({
      trained_model_id: trainedModel.id
    })
    store.state.workview.autoAnnotateModels = [autoAnnotateModel]
    store.state.workview.preselectedModelId = autoAnnotateModel.id

    store.commit('workview/SET_AUTO_ANNOTATE_CLASS_MAPPING', {
      runningSessionId: 'test',
      classMapping: [
        {
          annotationClassId: 1,
          modelClassLabel: 'class'
        }
      ]
    })
    expect(editor.preselectedModelClassMapping).toEqual([])
  })

  it('returns right data otherwise', () => {
    const trainedModel = buildTrainedModelPayload()
    store.state.neuralModel.trainedModels = [trainedModel]

    const autoAnnotateModel = buildRunningSessionPayload({
      trained_model_id: trainedModel.id
    })
    store.state.workview.autoAnnotateModels = [autoAnnotateModel]
    store.state.workview.preselectedModelId = autoAnnotateModel.id

    store.commit('workview/SET_AUTO_ANNOTATE_CLASS_MAPPING', {
      runningSessionId: autoAnnotateModel.id,
      classMapping: [
        {
          annotationClassId: 1,
          modelClassLabel: 'class'
        }
      ]
    })
    expect(editor.preselectedModelClassMapping).toEqual([{
      annotationClassId: 1,
      modelClassLabel: 'class'
    }])
  })
})

describe('setPreselectedAutoAnnotateModel', () => {
  it('does nothing if preselectedModelId is not undefined', () => {
    editor.store.state.workview.preselectedModelId = 'fake-model-id'
    const commit = jest.spyOn(store, 'commit').mockReturnValue(undefined)
    editor.setPreselectedAutoAnnotateModel()
    expect(commit).not.toHaveBeenCalled()
  })

  it('does nothing if autoAnnotateModels is an empty list', () => {
    editor.store.state.workview.preselectedModelId = 'fake-model-id'
    editor.store.state.workview.autoAnnotateModels = []
    const commit = jest.spyOn(store, 'commit').mockReturnValue(undefined)
    editor.setPreselectedAutoAnnotateModel()
    expect(commit).not.toHaveBeenCalled()
  })

  it('selects AutoAnnotation model if one is available', () => {
    const randomSession = buildRunningSessionPayload({
      id: 'random-session-id'
    })

    const trainedModel = buildTrainedModelPayload({
      model_template: buildModelTemplatePayload({
        type: ModelType.AutoAnnotation
      })
    })
    store.state.neuralModel.trainedModels = [trainedModel]

    const autoAnnotateModel = buildRunningSessionPayload({
      id: 'auto-annotate-id',
      trained_model_id: trainedModel.id
    })
    store.state.workview.autoAnnotateModels = [randomSession, autoAnnotateModel]

    const commit = jest.spyOn(store, 'commit').mockReturnValue(undefined)
    editor.setPreselectedAutoAnnotateModel()
    expect(commit).toHaveBeenCalledWith(
      'workview/SET_CURRENT_TOOL_PRESELECTED_MODEL_ID',
      autoAnnotateModel.id
    )
  })

  it('selects AutoAnnotation model if one is available', () => {
    store.state.neuralModel.trainedModels = [
      buildTrainedModelPayload({ id: 'trained-model-1' }),
      buildTrainedModelPayload({ id: 'trained-model-2' })
    ]

    const runningSession1 = buildRunningSessionPayload({
      id: 'running-session-1',
      trained_model_id: 'trained-model-1'
    })
    const runningSession2 = buildRunningSessionPayload({
      id: 'running-session-2',
      trained_model_id: 'trained-model-2'
    })
    store.state.workview.autoAnnotateModels = [runningSession1, runningSession2]

    const commit = jest.spyOn(store, 'commit').mockReturnValue(undefined)
    editor.setPreselectedAutoAnnotateModel()
    expect(commit).toHaveBeenCalledWith(
      'workview/SET_CURRENT_TOOL_PRESELECTED_MODEL_ID',
      runningSession1.id
    )
  })
})
