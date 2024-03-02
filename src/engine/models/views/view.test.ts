import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotation,
  buildAnnotationClassPayload,
  buildDatasetDetailPayload,
  buildDatasetDicomPayload,
  buildDatasetImagePayload,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildDatasetVideoPayload,
  buildImageData,
  buildImagePayload,
  buildLoadedImage,
  buildLoadedVideo,
  buildMembershipPayload,
  buildRenderableImage,
  buildRunningSessionPayload,
  buildTeamPayload,
  buildTrainedModelPayload,
  buildUserPayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'
import { outOfSubscribedStorageError } from 'test/unit/fixtures/errors'

import { connectStore } from '@/engine/connectStore'
import { Editor } from '@/engine/editor'
import { ActionGroup, ItemManager, AnnotationManagerWorkflowsV2 } from '@/engine/managers'
import { Annotation, CreateAnnotationParams, View } from '@/engine/models'
import { PolygonRenderer } from '@/engine/plugins/polygon/PolygonRenderer'
import { loadLqFrame } from '@/engine/utils'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { InferenceData } from '@/engineCommon/backend'
import { EditablePoint, Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { LoadedVideo } from '@/store/modules/workview/types'
import {
  AnnotationClassPayload,
  DatasetItemPayload,
  MembershipPayload,
  TeamPayload,
  UserPayload
} from '@/store/types'
import { ErrorWithMessage } from '@/utils'
import { ErrorCodes, errorsByExplicitCode } from '@/utils/error/errors'
import { ModelType } from '@/utils/wind/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let sam: UserPayload
let samMember: MembershipPayload
let v7: TeamPayload
let flaskAnnotationClass: AnnotationClass

let view: View

const sfh = buildDatasetPayload({ id: 1 })

const initView = (store: ReturnType<typeof createTestStore>): View => {
  const editor = new Editor(new ItemManager(store), store)
  connectStore(store, editor)
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
  return editor.viewsList[0]
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

jest.mock('@/engine/utils', () => {
  const engineUtils = jest.requireActual('@/engine/utils')

  return {
    ...engineUtils,
    loadLqFrame: jest.fn().mockResolvedValue(null)
  }
})

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  debounce: (fn: any) => {
    fn.cancel = jest.fn()
    return fn
  },
}))

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
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

  view = initView(store)

  view.setAnnotationClasses(store.state.aclass.classes)

  flaskAnnotationClass = view.annotationClasses.find(c => c.name === 'flask')!
})

afterEach(() => {
  jest.clearAllMocks()
  jest.useRealTimers()
})

it('avoids race condition when loading same item', async () => {
  jest.useFakeTimers()

  store = createTestStore()
  const editor = new Editor(new ItemManager(store), store)
  const view = editor.viewsList[0]

  const item1 = buildDatasetItemPayload({
    id: 1,
    dataset_image: buildDatasetImagePayload({
      id: 1,
      image: buildImagePayload({ id: 1 })
    })
  })

  jest.spyOn(view, 'jumpToFrame')

  jest.spyOn(store, 'dispatch')
    .mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: item1.dataset_image!.image }), 5000))
    )

  const promise1 = view.setItem(item1)
  const promise2 = view.setItem(item1)

  jest.runAllTimers()

  await Promise.all([promise1, promise2])

  expect(view.loadedVideo).toBeNull()
  expect(view.loadedImage).toEqual(item1.dataset_image!.image)
})

it('by default canvas background should stay empty', () => {
  expect(view.mainLayer.canvas.style.background).toEqual('')
})

describe('findAnnotationVertexAt', () => {
  it('dispatches store action', () => {
    const point = new Point<'Image'>({ x: 10, y: 10 })

    expect(view.findAnnotationVertexAt(point)).toEqual(undefined)

    const params: CreateAnnotationParams[] = [
      {
        classId: flaskAnnotationClass.id,
        data: { path: [{ x: 0, y: 0 }, { x: 20, y: 20 }, { x: 0, y: 20 }] },
        actors: [],
        type: 'polygon',
        zIndex: 1
      },
      {
        classId: flaskAnnotationClass.id,
        data: { path: [{ x: 10, y: 10 }, { x: 30, y: 30 }, { x: 0, y: 30 }] },
        actors: [],
        type: 'polygon',
        zIndex: 2
      }
    ]

    params.forEach(p => {
      const annotation = Annotation.createFromInstanceParams(view, p)!
      annotation.highlight(false)
      jest.spyOn(view.annotationManager, 'annotations', 'get').mockReturnValue([
        annotation
      ])
    })

    expect(view.findAnnotationVertexAt(point)).toEqual(point)
  })
})

describe('resolveAnnotationClass', () => {
  let annotationClasses: AnnotationClassPayload[]

  beforeEach(() => {
    const plugins = view.editor.pluginManager.pluginsForDataset(sfh, [])
    view.editor.installAllPlugins(plugins)
    annotationClasses = [
      buildAnnotationClassPayload({
        id: 1,
        team_id: sfh.team_id,
        datasets: [{ id: sfh.id }],
        metadata: { _color: 'rgba(0, 0, 0, 0.1)' },
        annotation_types: ['polygon']
      }),
      buildAnnotationClassPayload({
        id: 2,
        team_id: sfh.team_id,
        datasets: [{ id: sfh.id }],
        metadata: { _color: 'rgba(0, 0, 0, 0.1)' },
        annotation_types: ['skeleton']
      })
    ]
    store.commit('aclass/SET_CLASSES', annotationClasses)
    jest.spyOn(view.editor.classDialog, 'requestUserSelectClass').mockResolvedValue(null)
  })

  it('shows class dialog when none of annotation classes was preselected', async () => {
    store.commit('workview/PRESELECT_CLASS_ID', null)
    jest.spyOn(view.editor.classDialog, 'requestUserSelectClass')
      .mockResolvedValue(new AnnotationClass(annotationClasses[0]))
    const resolvedClass = await view.resolveAnnotationClass('polygon')

    expect(view.editor.classDialog.requestUserSelectClass).toBeCalledWith('polygon')
    expect(resolvedClass).not.toBeNull()
    expect(resolvedClass!.id).toEqual(annotationClasses[0].id)
  })

  it('resolves the preselected class if any', async () => {
    store.commit('workview/PRESELECT_CLASS_ID', annotationClasses[0].id)
    const resolvedClass = await view.resolveAnnotationClass('polygon')
    expect(view.editor.classDialog.requestUserSelectClass).not.toBeCalledWith('polygon')
    expect(resolvedClass).not.toBeNull()
    expect(resolvedClass!.id).toEqual(annotationClasses[0].id)
  })

  it('shows class dialog when class of other annotation type is preselected', async () => {
    store.commit('workview/PRESELECT_CLASS_ID', annotationClasses[0].id)
    jest.spyOn(view.editor.classDialog, 'requestUserSelectClass')
      .mockResolvedValue(new AnnotationClass(annotationClasses[1]))
    const resolvedClass = await view.resolveAnnotationClass('skeleton')
    expect(view.editor.classDialog.requestUserSelectClass).toBeCalledWith('skeleton')
    expect(resolvedClass).not.toBeNull()
    expect(resolvedClass!.id).toEqual(annotationClasses[1].id)
  })
})

describe('createAnnotation', () => {
  const group: ActionGroup = { do: () => {}, canUndo: false, remove: () => {} }

  beforeEach(() => {
    jest.spyOn(view.camera, 'scaleToFit').mockImplementation(() => {})
    jest
      .spyOn(view.editor.classDialog, 'requestUserSelectClass')
      .mockResolvedValue(flaskAnnotationClass)
  })

  const params: CreateAnnotationParams = {
    classId: 5,
    data: {},
    actors: [],
    type: 'tag',
    zIndex: null
  }

  describe('when no item', () => {
    it('does nothing', async () => {
      await view.createAnnotation(params, group)
      expect(store.dispatch).not.toHaveBeenCalled()
    })
  })

  describe('with image item', () => {
    let item: DatasetItemPayload

    beforeEach(() => {
      const datasetImage = buildDatasetImagePayload({ id: 21 })
      item = buildDatasetItemPayload({ id: 19, dataset_image_id: 21, dataset_image: datasetImage })
      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    })

    it('dispatches action', async () => {
      await view.createAnnotation(params)
      const payload = expect.objectContaining({
        annotation_class_id: 5,
        data: {},
        id: expect.any(String),
        isHighlighted: false,
        isSelected: false,
        isVisible: true,
        z_index: 1
      })
      expect(store.dispatch).toHaveBeenCalledWith(
        'workview/createStageAnnotation',
        payload
      )
    })
  })
})

describe('persistCreateAnnotation', () => {
  let annotation: Annotation

  beforeEach(() => {
    const params: CreateAnnotationParams = {
      classId: flaskAnnotationClass.id,
      data: { path: [] },
      actors: [],
      type: 'polygon',
      zIndex: 5
    }
    annotation = Annotation.createFromInstanceParams(view, params)!
  })

  it('dispatches store action', async () => {
    await view.annotationManager.persistCreateAnnotation(annotation)
    expect(store.dispatch)
      .toHaveBeenCalledWith('workview/createStageAnnotation', expect.objectContaining({
        annotation_class_id: flaskAnnotationClass.id,
        id: annotation.id,
        z_index: 5
      }))
  })

  it(`shows storage dialog if on ${outOfSubscribedStorageError.code}`, async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: outOfSubscribedStorageError })
    await view.annotationManager.persistCreateAnnotation(annotation)
    expect(store.state.billing.outOfStorageDialogShown).toBe(true)
  })

  it('dispatches custom message if user already in workflow', async () => {
    const error: ErrorWithMessage = {
      code: ErrorCodes.ALREADY_IN_WORKFLOW,
      detail: null,
      message: errorsByExplicitCode[ErrorCodes.ALREADY_IN_WORKFLOW],
      backendMessage: null,
      status: 422
    }
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error })
    await view.annotationManager.persistCreateAnnotation(annotation)
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', {
      content: expect.stringContaining('You are already assigned')
    })
  })

  describe('if DARWIN_V2_ENABLED flag is ON', () => {
    const stageInstance = buildV2WorkflowStageInstancePayload({ item_id: 'foo' })

    beforeEach(() => {
      store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', stageInstance)

      view.annotationManager = new AnnotationManagerWorkflowsV2(view)

      const dataset = buildDatasetPayload({ id: 1, slug: 'test', version: 2 })
      store.commit('dataset/SET_DATASETS', [dataset])
      const myDatasetDetails = buildDatasetDetailPayload({ id: 1 })
      store.commit('dataset/SET_CURRENT_DATASET_DETAILS', myDatasetDetails)
    })

    it('dispatches store action', async () => {
      await view.annotationManager.persistCreateAnnotation(annotation)
      expect(store.dispatch)
        .toHaveBeenCalledWith('workview/createV2Annotation', expect.objectContaining({
          annotation_class_id: flaskAnnotationClass.id,
          id: annotation.id,
          z_index: 5
        }))
    })

    it(`shows storage dialog if on ${outOfSubscribedStorageError.code}`, async () => {
      jest.spyOn(store, 'dispatch').mockResolvedValue({ error: outOfSubscribedStorageError })
      await view.annotationManager.persistCreateAnnotation(annotation)
      expect(store.state.billing.outOfStorageDialogShown).toBe(true)
    })

    it('dispatches custom message if user already in workflow', async () => {
      const error: ErrorWithMessage = {
        code: ErrorCodes.ALREADY_IN_WORKFLOW,
        detail: null,
        message: errorsByExplicitCode[ErrorCodes.ALREADY_IN_WORKFLOW],
        backendMessage: null,
        status: 422
      }
      jest.spyOn(store, 'dispatch').mockResolvedValue({ error })
      await view.annotationManager.persistCreateAnnotation(annotation)
      expect(store.dispatch).toHaveBeenCalledWith('toast/warning', {
        content: expect.stringContaining('You are already assigned')
      })
    })
  })
})

describe('persistUpdateAnnotation', () => {
  it('dispatches store action', () => {
    const params: CreateAnnotationParams = {
      classId: flaskAnnotationClass.id,
      data: { path: [] },
      actors: [],
      type: 'polygon',
      zIndex: 5
    }
    const annotation = Annotation.createFromInstanceParams(view, params)!
    view.annotationManager.persistUpdateAnnotation(annotation)

    expect(store.dispatch)
      .toHaveBeenCalledWith('workview/updateStageAnnotation', expect.objectContaining({
        annotation_class_id: flaskAnnotationClass.id,
        id: annotation.id,
        z_index: 5
      }))
  })
})

it('avoids race condition when loading video and image', async () => {
  jest.useFakeTimers()

  const item1 = buildDatasetItemPayload({
    id: 1,
    dataset_image: buildDatasetImagePayload({
      id: 1,
      image: buildImagePayload({ id: 1 })
    })
  })

  const item2 = buildDatasetItemPayload({
    id: 2,
    dataset_image: null,
    dataset_video: buildDatasetVideoPayload({ id: 2 }),
    dataset_video_id: 2
  })

  const item2Response: LoadedVideo = {
    id: 2,
    frames: {},
    currentFrameIndex: 0,
    fps: 0
  }

  jest.spyOn(view, 'jumpToFrame')

  jest.spyOn(store, 'dispatch')
    .mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: item1.dataset_image!.image }), 5000))
    )
    .mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: item2Response }), 2500))
    )

  const promise1 = view.setItem(item1)
  const promise2 = view.setItem(item2)

  jest.runAllTimers()

  await Promise.all([promise1, promise2])

  expect(view.loadedImage).toBeNull()
  expect(view.loadedVideo).toEqual(item2Response)
})

it('avoids race condition when loading image', async () => {
  jest.useFakeTimers()

  const item1 = buildDatasetItemPayload({
    id: 1,
    dataset_image: buildDatasetImagePayload({
      id: 1,
      image: buildImagePayload({ id: 1 })
    })
  })

  const item2 = buildDatasetItemPayload({
    id: 2,
    dataset_image: buildDatasetImagePayload({
      id: 2,
      image: buildImagePayload({ id: 2 })
    })
  })

  jest.spyOn(store, 'dispatch')
    .mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: item1.dataset_image!.image }), 5000))
    )
    .mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: item2.dataset_image!.image }), 2500))
    )

  const promise1 = view.setItem(item1)
  const promise2 = view.setItem(item2)

  jest.runAllTimers()

  await Promise.all([promise1, promise2])

  expect(view.loadedVideo).toBeNull()
  expect(view.loadedImage).toEqual(item2.dataset_image!.image)
})

it('avoids race condition when loading video', async () => {
  jest.useFakeTimers()

  const item1 = buildDatasetItemPayload({
    id: 1,
    dataset_image: null,
    dataset_video: buildDatasetVideoPayload({ id: 1 }),
    dataset_video_id: 1
  })

  const item1Response: LoadedVideo = {
    id: 1,
    frames: {},
    currentFrameIndex: 0,
    fps: 0
  }

  const item2 = buildDatasetItemPayload({
    id: 2,
    dataset_image: null,
    dataset_video: buildDatasetVideoPayload({ id: 2 }),
    dataset_video_id: 2
  })

  const item2Response: LoadedVideo = {
    id: 2,
    frames: {},
    currentFrameIndex: 0,
    fps: 0
  }

  jest.spyOn(view, 'jumpToFrame')

  jest.spyOn(store, 'dispatch')
    .mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: item1Response }), 5000))
    )
    .mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: item2Response }), 2500))
    )

  const promise1 = view.setItem(item1)
  const promise2 = view.setItem(item2)

  jest.runAllTimers()

  await Promise.all([promise1, promise2])

  expect(view.loadedImage).toBeNull()
  expect(view.loadedVideo).toEqual(item2Response)
})

describe('infer', () => {
  const point1 = new Point<'Image'>({ x: 1, y: 2 })
  const point2 = new Point<'Image'>({ x: 3, y: 4 })

  const firstData: InferenceData = {
    image: { url: 'fake.png' },
    data: {
      clicks: [],
      bbox: new Rectangle<'Image'>(point1, point2)
    }
  }

  const secondData: InferenceData = {
    image: { url: 'fake.png' },
    data: {
      bbox: new Rectangle<'Image'>(point1, point2),
      clicks: [{ x: 1, y: 1, type: 'add' }]
    }
  }

  beforeEach(() => {
    const trainedModel = buildTrainedModelPayload({
      model_template: { type: ModelType.AutoAnnotation }
    } as any)
    store.state.neuralModel.trainedModels = [trainedModel]

    const autoAnnotateModel = buildRunningSessionPayload({
      trained_model_id: trainedModel.id
    })
    store.state.workview.autoAnnotateModels = [autoAnnotateModel]
    store.state.workview.preselectedModelId = autoAnnotateModel.id
  })

  it('reports automation action on first click', async () => {
    await view.runInference('foo', firstData)
    expect(store.dispatch).toHaveBeenCalledWith('workviewTracker/reportAutomationAction')
  })

  it('does not report automation action on failure', async () => {
    await view.runInference('foo', secondData)
    expect(store.dispatch).not.toHaveBeenCalledWith('workviewTracker/reportAutomationAction')
  })

  it('does not report automation action on subsequent clicks', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: 'foo' })
    await view.runInference('foo', firstData)
    expect(store.dispatch).not.toHaveBeenCalledWith('workviewTracker/reportAutomationAction')
  })
})

it('drawHistogram works', () => {
  const imageData: ImageData = buildImageData(100, 100)

  const ctx = {
    strokeStyle: '',
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn()
  }

  const canvas = {
    width: 100,
    height: 100,
    getContext: () => ctx
  } as unknown as HTMLCanvasElement

  view.drawHistogram(canvas, imageData!, null)
  expect(ctx.beginPath).toBeCalled()
  expect(ctx.moveTo).toBeCalledTimes(256)
  expect(ctx.lineTo).toBeCalledTimes(256)
  expect(ctx.stroke).toBeCalled()
})

it('clearHistogram works', () => {
  const ctx = {
    clearRect: jest.fn()
  }
  const canvas = {
    width: 100,
    height: 100,
    getContext: () => ctx
  } as unknown as HTMLCanvasElement
  view.clearHistogram(canvas)
  expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 100, 100)
})

describe('renderHistogram', () => {
  beforeEach(() => {
    store.commit('workview/SET_DATASET', sfh)
  })

  it('draws image properly', async () => {
    const imageItem = buildDatasetItemPayload({
      id: 1,
      dataset_id: sfh.id,
      dataset_image_id: 1,
      dataset_image: buildDatasetImagePayload({
        id: 1,
        image: buildImagePayload({ id: 1 })
      })
    })
    const loadedImage = buildLoadedImage({
      id: 1,
      datasetImageId: 1,
      data: buildRenderableImage()
    })

    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: loadedImage })
    store.commit('workview/SET_SELECTED_DATASET_ITEM', imageItem)
    await flushPromises()

    jest.spyOn(view, 'clearHistogram').mockReturnValue(undefined)
    jest.spyOn(view, 'drawHistogram').mockReturnValue(undefined)

    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    view.renderHistogram(canvas)

    expect(view.clearHistogram).toBeCalled()
    expect(view.drawHistogram).toBeCalled()
  })

  it('should set default window levels', async () => {
    const videoItem = buildDatasetItemPayload({
      id: 1,
      dataset_id: sfh.id,
      dataset_image: null,
      dataset_video_id: 1,
      dataset_video: buildDatasetVideoPayload({
        id: 1,
        metadata: { type: 'dicom', default_window: { min: 100, max: 201 } }
      })
    })
    const loadedVideo = buildLoadedVideo({ id: 1 })

    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: loadedVideo })
    store.commit('workview/SET_SELECTED_DATASET_ITEM', videoItem)
    await flushPromises()

    const { activeView } = view.editor
    expect(activeView.renderManager).toEqual(expect.objectContaining({ windowLevels: [100, 201] }))
  })
})

describe('renderingImage definition', () => {
  beforeEach(() => {
    store.commit('workview/SET_DATASET', sfh)
  })

  it('is correct for loaded image', async () => {
    const imageItem = buildDatasetItemPayload({
      id: 1,
      dataset_id: sfh.id,
      dataset_image_id: 1,
      dataset_image: buildDatasetImagePayload({
        id: 1,
        image: buildImagePayload({ id: 1 })
      })
    })
    const loadedImage = buildLoadedImage({
      id: 1,
      datasetImageId: 1,
      data: buildRenderableImage()
    })
    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: loadedImage })
    store.commit('workview/SET_SELECTED_DATASET_ITEM', imageItem)
    await flushPromises()
    expect(view.renderingImage).toEqual(loadedImage.data)
    expect(view.renderingImage).not.toBeNull()
    expect(view.renderingImageData).toBeDefined()
    expect(view.renderingImageData!.width).toBe(100)
    expect(view.renderingImageData!.height).toBe(100)
    expect(view.videoMetadata).toBe(null)
  })

  it('is correct for loaded video', () => {
    const videoItem = buildDatasetItemPayload({
      id: 1,
      dataset_id: sfh.id,
      dataset_image: null,
      dataset_video_id: 1,
      dataset_video: buildDatasetVideoPayload({
        id: 1,
        annotate_as_video: true
      })
    })
    const loadedVideo = buildLoadedVideo({
      id: 1,
      frames: {
        0: {
          seq: 1,
          hqUrl: 'hqurl0',
          lqUrl: 'lqurl0',
          hqData: buildRenderableImage(),
          lqData: buildRenderableImage(),
          hqDataLoaded: true,
          lqDataLoaded: true
        }
      },
      currentFrameIndex: 0,
      fps: 5
    })

    view.currentItem = videoItem
    view.loadedVideo = loadedVideo

    expect(view.renderingImage).toEqual(loadedVideo.frames[0].lqData)
    expect(view.renderingImage).not.toBeNull()
    expect(view.renderingImageData).toBeDefined()
    expect(view.renderingImageData!.width).toBe(100)
    expect(view.renderingImageData!.height).toBe(100)
    expect(view.videoMetadata).toEqual({ type: 'video' })
  })

  // TODO: It has problems from time to time with generate image data comparison
  it.skip('is correct for loaded dicom', async () => {
    const dicomItem = buildDatasetItemPayload({
      id: 1,
      dataset_id: sfh.id,
      dataset_image: null,
      dataset_video_id: 1,
      dataset_video: buildDatasetVideoPayload({
        id: 1,
        annotate_as_video: true,
        original_filename: 'test.dcm',
        metadata: { type: 'dicom' }
      }),
      filename: 'test.dcm'
    })
    const loadedVideo = buildLoadedVideo({
      id: 1,
      frames: {
        0: {
          seq: 1,
          hqUrl: 'hqurl0',
          lqUrl: 'lqurl0',
          hqData: buildRenderableImage(),
          lqData: null,
          hqDataLoaded: true,
          lqDataLoaded: true
        }
      },
      currentFrameIndex: 0,
      fps: 5
    })

    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: loadedVideo })
    store.commit('workview/SET_SELECTED_DATASET_ITEM', dicomItem)
    await flushPromises()

    expect(view.renderingImage).toEqual(loadedVideo.frames[0].hqData)
    expect(view.renderingImage).not.toBeNull()
    expect(view.renderingImageData).toBeDefined()
    expect(view.renderingImageData!.width).toBe(100)
    expect(view.renderingImageData!.height).toBe(100)
    expect(view.videoMetadata).toEqual({ type: 'dicom' })
  })

  it('is correct for loaded pdf', async () => {
    const pdfItem = buildDatasetItemPayload({
      id: 1,
      dataset_id: sfh.id,
      dataset_image: null,
      dataset_video_id: 1,
      dataset_video: buildDatasetVideoPayload({
        id: 1,
        annotate_as_video: true,
        original_filename: 'test.pdf',
        metadata: { type: 'pdf' }
      }),
      filename: 'test.pdf'
    })
    const loadedVideo = buildLoadedVideo({
      id: 1,
      frames: {
        0: {
          seq: 1,
          hqUrl: 'hqurl0',
          lqUrl: 'lqurl0',
          hqData: buildRenderableImage(),
          lqData: buildRenderableImage(),
          hqDataLoaded: true,
          lqDataLoaded: true
        }
      },
      currentFrameIndex: 0,
      fps: 5
    })

    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: loadedVideo })
    store.commit('workview/SET_SELECTED_DATASET_ITEM', pdfItem)
    await flushPromises()

    expect(view.renderingImage).toEqual(loadedVideo.frames[0].lqData)
    expect(view.renderingImage).not.toBeNull()
    expect(view.renderingImageData).toBeDefined()
    expect(view.renderingImageData!.width).toBe(100)
    expect(view.renderingImageData!.height).toBe(100)
    expect(view.videoMetadata).toEqual({ type: 'pdf' })
  })
})

describe('selectNextAnnotation', () => {
  let firstAnnotation: Annotation
  let secondAnnotation: Annotation
  let lastAnnotation: Annotation

  beforeEach(() => {
    store.commit('workview/SET_DATASET', sfh)
    firstAnnotation = buildAnnotation(view.editor, { isVisible: true })!
    secondAnnotation = buildAnnotation(view.editor, { isVisible: true })!
    lastAnnotation = buildAnnotation(view.editor, { isVisible: true })!
    jest.spyOn(view.annotationManager, 'annotations', 'get').mockReturnValue([
      firstAnnotation,
      secondAnnotation,
      lastAnnotation
    ])
  })

  it('selects the first annotation when there is no selected one', () => {
    expect(firstAnnotation.isSelected).toBeFalsy()
    expect(secondAnnotation.isSelected).toBeFalsy()
    expect(lastAnnotation.isSelected).toBeFalsy()

    jest.spyOn(firstAnnotation, 'select').mockReturnValue(undefined)
    const nextAnnotation = view.selectNextAnnotation()
    expect(nextAnnotation).toEqual(firstAnnotation)
  })

  it('selects the second annotation when the first one is selected', () => {
    firstAnnotation.select(false)
    jest.spyOn(secondAnnotation, 'select').mockReturnValue(undefined)
    const nextAnnotation = view.selectNextAnnotation()
    expect(nextAnnotation).toEqual(secondAnnotation)
    expect(secondAnnotation.select).toBeCalled()
  })

  it('selects the first annotation when the last one is selected', () => {
    lastAnnotation.select(false)
    jest.spyOn(firstAnnotation, 'select').mockReturnValue(undefined)
    const nextAnnotation = view.selectNextAnnotation()
    expect(nextAnnotation).toEqual(firstAnnotation)
    expect(firstAnnotation.select).toBeCalled()
  })
})

describe('selectPreviousAnnotation', () => {
  let firstAnnotation: Annotation
  let secondAnnotation: Annotation
  let lastAnnotation: Annotation

  beforeEach(() => {
    store.commit('workview/SET_DATASET', sfh)
    firstAnnotation = buildAnnotation(view.editor, { isVisible: true })!
    secondAnnotation = buildAnnotation(view.editor, { isVisible: true })!
    lastAnnotation = buildAnnotation(view.editor, { isVisible: true })!
    jest.spyOn(view.annotationManager, 'annotations', 'get').mockReturnValue([
      firstAnnotation,
      secondAnnotation,
      lastAnnotation
    ])
  })

  it('selects the last annotation when there is no selected one', () => {
    expect(firstAnnotation.isSelected).toBeFalsy()
    expect(secondAnnotation.isSelected).toBeFalsy()
    expect(lastAnnotation.isSelected).toBeFalsy()

    jest.spyOn(lastAnnotation, 'select').mockReturnValue(undefined)
    const previousAnnotation = view.selectPreviousAnnotation()
    expect(previousAnnotation).toEqual(lastAnnotation)
    expect(lastAnnotation.select).toBeCalled()
  })

  it('selects the first annotation when the second one is selected', () => {
    secondAnnotation.select(false)
    jest.spyOn(firstAnnotation, 'select').mockReturnValue(undefined)
    const previousAnnotation = view.selectPreviousAnnotation()
    expect(previousAnnotation).toEqual(firstAnnotation)
    expect(firstAnnotation.select).toBeCalled()
  })

  it('selects the last annotation when the first one is selected', () => {
    firstAnnotation.select(false)
    jest.spyOn(lastAnnotation, 'select').mockReturnValue(undefined)
    const previousAnnotation = view.selectPreviousAnnotation()
    expect(previousAnnotation).toEqual(lastAnnotation)
    expect(lastAnnotation.select).toBeCalled()
  })
})

describe('zoomToAnnotation', () => {
  let annotation: Annotation

  beforeEach(() => {
    store.commit('workview/SET_DATASET', sfh)
    annotation = buildAnnotation(view.editor, { isVisible: true })!
    jest.spyOn(view.renderManager, 'rendererFor')
      .mockImplementation(() => ({
        getAllVertices: () => ([
          new EditablePoint({ x: 0, y: 0 }),
          new EditablePoint({ x: 0, y: 10 }),
          new EditablePoint({ x: 10, y: 10 }),
          new EditablePoint({ x: 10, y: 0 })
        ])
      }) as any)
    jest.spyOn(view.camera, 'imageViewToCanvasView')
      .mockImplementation(point => new Point<'Canvas'>(point))
    view.camera.image = { width: 120, height: 230 }
  })

  it('zoom to annotation with 20% padding', () => {
    jest.spyOn(view.camera, 'zoomToBox').mockReturnValue(undefined)
    view.editor.zoomToAnnotation(annotation)
    expect(view.camera.zoomToBox).toBeCalledWith(
      expect.objectContaining({ x: -12, y: -23 }),
      expect.objectContaining({ x: 10 + 12, y: 10 + 23 })
    )
  })
})

describe('DICOM item with layout', () => {
  let item: DatasetItemPayload
  let loadedVideo: LoadedVideo

  beforeEach(() => {
    item = buildDatasetItemPayload({
      id: 1,
      dataset_video: buildDatasetDicomPayload({
        metadata: {
          type: 'dicom',
          layout: {
            groups: [[0, 1], [2, 3]],
            name: 'horizontal'
          }
        }
      })
    })

    loadedVideo = buildLoadedVideo({
      id: 1,
      frames: {
        0: {
          seq: 1,
          hqUrl: 'hqurl0',
          lqUrl: 'lqurl0',
          hqData: buildRenderableImage(),
          lqData: buildRenderableImage(),
          hqDataLoaded: true,
          lqDataLoaded: true
        },
        1: {
          seq: 1,
          hqUrl: 'hqurl0',
          lqUrl: 'lqurl0',
          hqData: buildRenderableImage(),
          lqData: buildRenderableImage(),
          hqDataLoaded: true,
          lqDataLoaded: true
        },
        2: {
          seq: 1,
          hqUrl: 'hqurl0',
          lqUrl: 'lqurl0',
          hqData: buildRenderableImage(),
          lqData: buildRenderableImage(),
          hqDataLoaded: true,
          lqDataLoaded: true
        },
        3: {
          seq: 1,
          hqUrl: 'hqurl0',
          lqUrl: 'lqurl0',
          hqData: buildRenderableImage(),
          lqData: buildRenderableImage(),
          hqDataLoaded: true,
          lqDataLoaded: true
        }
      },
      currentFrameIndex: 0,
      fps: 5
    })

    view.setItem(item, item.dataset_video?.metadata.layout?.groups[0])
    view.loadedVideo = loadedVideo
    view.currentFrameIndex = view.itemGroup![0]
  })

  it('frames getter should return Map of frames related to the View section', () => {
    expect(view.frames).toEqual({
      0: loadedVideo.frames[0],
      1: loadedVideo.frames[1]
    })
  })

  it('zeroBasedFrames getter should return Map of frames with zero-based groups indexes', () => {
    expect(view.zeroBasedFrames).toEqual({
      0: loadedVideo.frames[0],
      1: loadedVideo.frames[1]
    })
  })

  it('itemLayout getter should return items layout', () => {
    expect(view.itemLayout).toEqual(item.dataset_video?.metadata.layout)
  })

  it('framesIndexes getter should return frames indexes list related to the View section', () => {
    expect(view.framesIndexes).toEqual([0, 1])
  })

  it('zeroBasedFramesIndexes getter should return frames indexes list, related to the View section, zero-based', () => {
    expect(view.zeroBasedFramesIndexes).toEqual([0, 1])
  })

  it('currentFrameIndex getter return current frame index', () => {
    view.currentFrameIndex = view.itemGroup![1]
    expect(view.currentFrameIndex).toBe(1)
  })

  it('zeroBasedCurrentFrameIndex getter return current frame index, zero-based', () => {
    expect(view.zeroBasedCurrentFrameIndex).toBe(0)
  })

  it('toZeroBasedIndex should convert index to zero-based', () => {
    expect(view.toZeroBasedIndex(view.currentFrameIndex)).toBe(0)
  })

  it('toOriginBasedIndex should convert index back to origin', () => {
    expect(view.toOriginBasedIndex(0)).toBe(view.currentFrameIndex)
  })
})

describe('DICOM item without layout', () => {
  let loadedVideo: LoadedVideo

  beforeEach(() => {
    const item = buildDatasetItemPayload({
      id: 1,
      dataset_video: buildDatasetDicomPayload()
    })

    loadedVideo = buildLoadedVideo({
      id: 1,
      frames: {
        0: {
          seq: 1,
          hqUrl: 'hqurl0',
          lqUrl: 'lqurl0',
          hqData: buildRenderableImage(),
          lqData: buildRenderableImage(),
          hqDataLoaded: true,
          lqDataLoaded: true
        },
        1: {
          seq: 1,
          hqUrl: 'hqurl0',
          lqUrl: 'lqurl0',
          hqData: buildRenderableImage(),
          lqData: buildRenderableImage(),
          hqDataLoaded: true,
          lqDataLoaded: true
        }
      },
      currentFrameIndex: 0,
      fps: 5
    })

    view.setItem(item)
    view.loadedVideo = loadedVideo
  })

  it('frames getter should return Map of the loadedVideo frames', () => {
    expect(view.frames).toEqual({
      0: loadedVideo.frames[0],
      1: loadedVideo.frames[1]
    })
  })

  it('zeroBasedFrames getter should return Map of the loadedVideo frames', () => {
    expect(view.zeroBasedFrames).toEqual({
      0: loadedVideo.frames[0],
      1: loadedVideo.frames[1]
    })
    expect(view.zeroBasedFrames).toEqual(view.frames)
  })

  it('framesIndexes getter should return loadedVideo frames', () => {
    expect(view.framesIndexes).toEqual([0, 1])
  })

  it('should set canvas background to black', () => {
    expect(view.mainLayer.canvas.style.background).toEqual('rgb(0, 0, 0)')
  })
})

describe('isInViewport', () => {
  beforeEach(() => {
    view.editor.activeView.renderManager.registerAnnotationRenderer(
      'polygon',
      new PolygonRenderer(view.editor)
    )

    view.camera.width = 100
    view.camera.height = 100
  })

  it('should return "true" if annotation renderer is not found', () => {
    const annotation = buildAnnotation(view.editor, {
      type: 'bounding_box',
      data: {
        topLeft: { x: 0, y: 0, isSelected: false, isHighlighted: false },
        topRight: { x: 10, y: 0, isSelected: false, isHighlighted: false },
        bottomLeft: { x: 0, y: 10, isSelected: false, isHighlighted: false },
        bottomRight: { x: 10, y: 10, isSelected: false, isHighlighted: false }
      }
    }) as Annotation

    expect(view.isInViewport(annotation)).toBeTruthy()
  })

  it('should return "true" if annotation inside the viewport', () => {
    const annotation = buildAnnotation(view.editor, {
      type: 'polygon',
      data: {
        path: [{ x: 0, y: 0 }, { x: 21, y: 30 }, { x: 0, y: 36 }]
      }
    }) as Annotation

    expect(view.isInViewport(annotation)).toBeTruthy()
  })

  it('should return "false" if annotation outside the viewport', () => {
    const annotation = buildAnnotation(view.editor, {
      type: 'polygon',
      data: {
        path: [{ x: 101, y: 101 }, { x: 121, y: 130 }, { x: 101, y: 136 }]
      }
    }) as Annotation

    expect(view.isInViewport(annotation)).toBeFalsy()
  })
})

describe('load frames', () => {
  jest.useRealTimers()
  let item: DatasetItemPayload
  let loadedVideo: LoadedVideo

  beforeEach(() => {
    (loadLqFrame as jest.Mock).mockImplementation((frame, frameIndex, view) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const { buildRenderableImage } = jest.requireActual('test/unit/factories')
          frame.lqData = buildRenderableImage()
          frame.lqDataLoaded = true

          view.store.commit('workview/SET_LOADED_VIDEO_FRAME_LOADED', {
            datasetVideoId: view.loadedVideo.id,
            frameIndex,
            frame
          })

          resolve(true)
        }, 1)
      })
    })

    const frames: any = {}
    Array.from(new Array(100)).forEach((_, i) => {
      frames[i] = {
        seq: i,
        hqUrl: 'hqurl0',
        lqUrl: 'lqurl0',
        hqData: null,
        lqData: null,
        hqDataLoaded: false,
        lqDataLoaded: false
      }
    })

    loadedVideo = buildLoadedVideo({
      id: 1,
      frames,
      currentFrameIndex: 0,
      fps: 5
    })

    store.dispatch = jest.fn().mockImplementation((action: string) => {
      if (action === 'workview/loadItem') {
        return {
          data: loadedVideo
        }
      }
      return {}
    })

    item = buildDatasetItemPayload({
      id: 1,
      dataset_video: buildDatasetVideoPayload({ id: 1 }),
      dataset_image: null,
      dataset_video_id: 1
    })

    view.setItem(item)
  })

  it('play video should wait for current frame loaded to move to the next one', (done) => {
    (loadLqFrame as jest.Mock).mockImplementation((frame, frameIndex, view) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const { buildRenderableImage } = jest.requireActual('test/unit/factories')
          frame.lqData = buildRenderableImage()
          frame.lqDataLoaded = true

          view.store.commit('workview/SET_LOADED_VIDEO_FRAME_LOADED', {
            datasetVideoId: view.loadedVideo.id,
            frameIndex,
            frame
          })

          resolve(true)
        }, 600)
      })
    })

    view.playVideo()

    setTimeout(() => {
      expect(view.currentFrameIndex).toBe(0)

      done()
    }, 500)
  })

  it('should start frames loading thread on setItem call', (done) => {
    jest.spyOn(view, 'loadFrame')

    setTimeout(() => {
      expect(view.loadFrame).toHaveBeenCalledWith(1)
      expect(view.loadFrame).toHaveBeenCalledWith(2)
      expect(view.loadFrame).toHaveBeenCalledWith(3)

      done()
    }, 100)
  })

  it('should start new frames loading thread on jumpToFrame', (done) => {
    jest.spyOn(view, 'loadFrame')

    setTimeout(() => {
      expect(view.loadFrame).toHaveBeenCalledWith(1)
      expect(view.loadFrame).toHaveBeenCalledWith(2)
      expect(view.loadFrame).toHaveBeenCalledWith(3)

      view.jumpToFrame(50)

      setTimeout(() => {
        expect(view.loadFrame).toHaveBeenCalledWith(50)
        expect(view.loadFrame).toHaveBeenCalledWith(51)
        expect(view.loadFrame).toHaveBeenCalledWith(52)

        done()
      }, 100)
    }, 100)
  })

  it('should load only frames from group config', (done) => {
    item = buildDatasetItemPayload({
      id: 1,
      dataset_image: null,
      dataset_video_id: 1,
      dataset_video: buildDatasetDicomPayload({
        metadata: {
          type: 'dicom',
          layout: {
            groups: [[0, 1], [2, 3]],
            name: 'horizontal'
          }
        }
      })
    })

    view.setItem(item, item.dataset_video?.metadata.layout?.groups[1])

    setTimeout(() => {
      expect(view.loadedVideo!.frames[1].lqDataLoaded).toBeFalsy()
      expect(view.loadedVideo!.frames[2].lqDataLoaded).toBeTruthy()
      expect(view.loadedVideo!.frames[3].lqDataLoaded).toBeTruthy()
      expect(view.loadedVideo!.frames[4].lqDataLoaded).toBeFalsy()

      done()
    }, 100)
  })
})
