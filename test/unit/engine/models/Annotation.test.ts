import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildStageAnnotationPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import {
  Annotation,
  AnnotationData,
  CreateAnnotationParams,
  ImageSubAnnotation,
  isVideoAnnotationData,
  SubAnnotationPayload
} from '@/engine/models'
import { EditablePoint } from '@/engineCommon/point'
import { loadStageAnnotationPayload } from '@/store/modules/workview/utils'
import {
  StageAnnotationPayload,
  TrainingClass,
  VideoDataPayload,
  WorkflowStagePayload
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const sfh = buildDatasetPayload({ id: 1 })
const flask = buildAnnotationClassPayload({
  id: 1,
  name: 'flask',
  annotation_types: ['polygon'],
  datasets: [{ id: sfh.id }]
})

describe('Stage Annotation', () => {
  let store: ReturnType<typeof createTestStore>
  let editor: Editor
  let stage: WorkflowStagePayload

  const initEditor = (store: ReturnType<typeof createTestStore>): Editor => {
    const editor = new Editor(new ItemManager(store), store)
    jest.spyOn(editor.camera, 'scaleToFit').mockReturnValue(undefined)
    const sfh = buildDatasetPayload({ id: 1 })
    editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
    return editor
  }

  beforeEach(() => {
    stage = buildWorkflowStagePayload({ id: 1 })
    store = createTestStore()
    setDefaultAnnotationTypes(store)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    store.commit('aclass/SET_CLASSES', [flask])
    store.commit('workview/SET_DATASET', sfh)
    editor = initEditor(store)
  })

  describe('Image Annotation', () => {
    let flaskAnnotationPayload: StageAnnotationPayload
    let annotationData: AnnotationData

    beforeEach(() => {
      annotationData = { polygon: { path: [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }] } }
      flaskAnnotationPayload = buildStageAnnotationPayload({
        id: 'annotation1',
        annotation_class_id: flask.id,
        data: annotationData,
        z_index: 2,
        workflow_stage_id: stage.id
      })
    })

    it('createFromDeserializable', () => {
      const annotation = Annotation.createFromDeserializable(
        editor.activeView,
        loadStageAnnotationPayload(flaskAnnotationPayload)
      )
      expect(annotation).toBeDefined()
      if (!annotation) { return }
      expect(annotation.id).toBe('annotation1')
      expect(annotation.classId).toBe(flask.id)
      expect(annotation.zIndex).toBe(2)
      expect(annotation.data).toBeDefined()
      expect(annotation.workflowStageId).toBe(stage.id)
      expect(isVideoAnnotationData(annotation.data)).toBeFalsy()
      if (isVideoAnnotationData(annotation.data)) { return }
      expect(annotation.data.path).toHaveLength(3)
    })

    it('createSubAnnotation', () => {
      const parent = Annotation.createFromDeserializable(
        editor.activeView,
        loadStageAnnotationPayload(flaskAnnotationPayload)
      )
      expect(parent).not.toBeNull()
      if (!parent) { return }

      const params: SubAnnotationPayload = {
        parent,
        data: { instance_id: { value: 2 } },
        type: 'instance_id'
      }
      const annotation = Annotation.createSubAnnotation(editor.activeView, params)
      expect(annotation).toBeDefined()
      if (!annotation) { return }

      expect(annotation.id).toEqual(expect.any(String))
      expect(annotation.zIndex).toBe(parent.zIndex)
      expect(annotation.data).toEqual({ instance_id: { value: 2 } })
      expect(annotation.type).toBe('instance_id')
      expect(annotation.workflowStageId).toBe(stage.id)
      expect(annotation.subAnnotations).toHaveLength(0)
    })

    describe('createFromInstanceParams', () => {
      it('creates a polygon annotation', () => {
        const params: CreateAnnotationParams = {
          classId: flask.id,
          actors: [],
          data: annotationData,
          workflowStageId: stage.id,
          type: 'polygon',
          zIndex: 1
        }
        const annotation = Annotation.createFromInstanceParams(editor.activeView, params)
        expect(annotation).toBeDefined()
        if (!annotation) { return }

        expect(annotation.id).toEqual(expect.any(String))
        expect(annotation.classId).toBe(flask.id)
        expect(annotation.zIndex).toBe(1)
        expect(annotation.data).toEqual(annotationData)
        expect(annotation.type).toBe('polygon')
        expect(annotation.workflowStageId).toBe(stage.id)
        expect(annotation.isSelected).toBeTruthy()
        expect(annotation.isHighlighted).toBeFalsy()
        expect(annotation.isVisible).toBeTruthy()
      })

      it('creates a tag annotation', () => {
        const tagAnnotationData = { tag: {} }
        const params: CreateAnnotationParams = {
          classId: flask.id,
          actors: [],
          data: tagAnnotationData,
          workflowStageId: stage.id,
          type: 'tag',
          zIndex: 1
        }
        const annotation = Annotation.createFromInstanceParams(editor.activeView, params)
        expect(annotation).toBeDefined()
        if (!annotation) { return }

        expect(annotation.id).toEqual(expect.any(String))
        expect(annotation.classId).toBe(flask.id)
        expect(annotation.zIndex).toBe(1)
        expect(annotation.data).toEqual(tagAnnotationData)
        expect(annotation.type).toBe('tag')
        expect(annotation.workflowStageId).toBe(stage.id)
        expect(annotation.isSelected).toBeFalsy()
        expect(annotation.isHighlighted).toBeFalsy()
        expect(annotation.isVisible).toBeTruthy()
      })
    })

    describe('createFromInferenceData', () => {
      it('returns null if inference data has no "name" or "label" field', () => {
        expect(Annotation.createFromInferenceData(editor.activeView, {}, [])).toBeNull()
      })

      it('returns null if label does not match any given classes', () => {
        const inferenceData = { label: 'test' }
        expect(Annotation.createFromInferenceData(editor.activeView, inferenceData, [])).toBeNull()
      })

      it('returns null if inference data cannot be normalized', () => {
        const trainingClasses: TrainingClass[] = [
          { id: 'one-id', name: 'one', type: 'polygon', subs: [] }
        ]
        const inferenceData = { label: 'one' }
        const annotation = Annotation.createFromInferenceData(
          editor.activeView,
          inferenceData,
          trainingClasses
        )
        expect(annotation).toBeNull()
      })

      it('constructs annotation object correctly otherwise', () => {
        const trainingClasses: TrainingClass[] = [
          { id: 'one-id', name: 'one', type: 'polygon', subs: [] }
        ]
        const path = [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }]
        const inferenceData = { polygon: { path }, label: 'one' }
        const annotation = Annotation.createFromInferenceData(
          editor.activeView,
          inferenceData,
          trainingClasses
        )
        expect(annotation).not.toBeNull()

        const expectedAnnotation = annotation!
        expect(expectedAnnotation.type).toEqual('polygon')
        expect(expectedAnnotation.data).toEqual({
          path: path.map(p => new EditablePoint(p)),
          additionalPaths: undefined,
          label: 'one'
        })
        expect(expectedAnnotation.subAnnotations).toEqual([])
      })

      it('it includes text sub annotation if present', () => {
        const trainingClasses: TrainingClass[] = [
          { id: 'one-id', name: 'one', type: 'polygon', subs: [] }
        ]
        const path = [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }]
        const inferenceData = {
          polygon: { path },
          label: 'one',
          text: { text: 'text' }
        }
        const annotation = Annotation.createFromInferenceData(
          editor.activeView,
          inferenceData,
          trainingClasses
        )
        expect(annotation).not.toBeNull()

        const expectedAnnotation = annotation!
        expect(expectedAnnotation.type).toEqual('polygon')
        expect(expectedAnnotation.data).toEqual({
          path: path.map(p => new EditablePoint(p)),
          additionalPaths: undefined,
          label: 'one'
        })

        const [textSubAnnotation] = expectedAnnotation.subAnnotations as ImageSubAnnotation[]
        expect(textSubAnnotation.type).toEqual('text')
        expect(textSubAnnotation.data).toEqual({ text: 'text' })
      })

      it('it includes inference sub annotation if present', () => {
        const trainingClasses: TrainingClass[] = [
          { id: 'one-id', name: 'one', type: 'polygon', subs: [] }
        ]
        const path = [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }]
        const inferenceData = {
          polygon: { path },
          label: 'one',
          inference: {
            confidence: 0.5,
            model: {
              id: 'fake-model-id',
              name: 'Fake Model',
              type: 'instance_segmentation'
            }
          }
        }
        const annotation = Annotation.createFromInferenceData(
          editor.activeView,
          inferenceData,
          trainingClasses
        )
        expect(annotation).not.toBeNull()

        const expectedAnnotation = annotation!
        expect(expectedAnnotation.type).toEqual('polygon')
        expect(expectedAnnotation.data).toEqual({
          path: path.map(p => new EditablePoint(p)),
          additionalPaths: undefined,
          label: 'one'
        })

        const [textSubAnnotation] = expectedAnnotation.subAnnotations as ImageSubAnnotation[]
        expect(textSubAnnotation.type).toEqual('inference')
        expect(textSubAnnotation.data).toEqual({
          confidence: 0.5,
          model: {
            id: 'fake-model-id',
            name: 'Fake Model',
            type: 'instance_segmentation'
          }
        })
      })
    })

    describe('shallowClone', () => {
      let original: Annotation

      beforeEach(() => {
        const annotation = Annotation.createFromDeserializable(
          editor.activeView,
          loadStageAnnotationPayload(flaskAnnotationPayload)
        )
        expect(annotation).not.toBeNull()
        if (!annotation) { return }
        original = annotation
      })

      it('shallowClone without params', () => {
        const annotation = original.shallowClone()
        expect(annotation.id).toBe('annotation1')
        expect(annotation.classId).toBe(flask.id)
        expect(annotation.zIndex).toBe(2)
        expect(annotation.id).toBe(original.id)
        expect(annotation.workflowStageId).toBe(stage.id)
        expect(annotation.data).toBeDefined()
        expect(isVideoAnnotationData(annotation.data)).toBeFalsy()
        if (isVideoAnnotationData(annotation.data)) { return }
        expect(annotation.data.path).toHaveLength(3)
      })

      it('shallowClone with params', () => {
        const annotation = original.shallowClone({ data: { path: [{ x: 1, y: 2 }] } })
        expect(annotation.id).toBe('annotation1')
        expect(annotation.classId).toBe(flask.id)
        expect(annotation.zIndex).toBe(2)
        expect(annotation.id).toBe(original.id)
        expect(annotation.workflowStageId).toBe(stage.id)
        expect(annotation.data).toBeDefined()
        expect(isVideoAnnotationData(annotation.data)).toBeFalsy()
        if (isVideoAnnotationData(annotation.data)) { return }
        expect(annotation.data.path).toHaveLength(1)
      })
    })

    describe('deep clone', () => {
      let original: Annotation

      beforeEach(() => {
        const annotation = Annotation.createFromDeserializable(
          editor.activeView,
          loadStageAnnotationPayload(flaskAnnotationPayload)
        )
        expect(annotation).not.toBeNull()
        if (!annotation) { return }
        original = annotation
      })

      it('clone without params', () => {
        const annotation = original.clone()
        expect(annotation.classId).toBe(flask.id)
        expect(annotation.zIndex).toBe(2)
        expect(annotation.id).toEqual(expect.any(String))
        expect(annotation.id).not.toEqual(original.id)
        expect(annotation.workflowStageId).toBe(stage.id)
        expect(annotation.data).toBeDefined()
        expect(isVideoAnnotationData(annotation.data)).toBeFalsy()
        if (isVideoAnnotationData(annotation.data)) { return }
        expect(annotation.data.path).toHaveLength(3)
      })

      it('clone with params', () => {
        const annotation = original.clone({ data: { path: [{ x: 1, y: 2 }] } })
        expect(annotation.classId).toBe(flask.id)
        expect(annotation.zIndex).toBe(2)
        expect(annotation.id).toEqual(expect.any(String))
        expect(annotation.id).not.toEqual(original.id)
        expect(annotation.workflowStageId).toBe(stage.id)
        expect(annotation.data).toBeDefined()
        expect(isVideoAnnotationData(annotation.data)).toBeFalsy()
        if (isVideoAnnotationData(annotation.data)) { return }
        expect(annotation.data.path).toHaveLength(1)
      })
    })

    describe('show', () => {
      let original: Annotation

      beforeEach(() => {
        const annotation = Annotation.createFromDeserializable(
          editor.activeView,
          loadStageAnnotationPayload(flaskAnnotationPayload)
        )
        expect(annotation).not.toBeNull()
        if (!annotation) { return }
        original = annotation
      })

      it('sets isVisible to true', () => {
        const annotation = original.clone()
        annotation.show(false)
        expect(annotation.isVisible).toBeTruthy()
      })

      it('commits workview/SHOW_ANNOTATION', () => {
        const annotation = original.clone()
        annotation.hide(false)
        jest.spyOn(store, 'commit').mockReturnValue(undefined)

        annotation.show(true)
        expect(annotation.isVisible).toBeTruthy()
        expect(store.commit).toBeCalledWith('workview/SHOW_ANNOTATION', annotation.id)
      })
    })

    describe('hide', () => {
      let original: Annotation

      beforeEach(() => {
        const annotation = Annotation.createFromDeserializable(
          editor.activeView,
          loadStageAnnotationPayload(flaskAnnotationPayload)
        )
        expect(annotation).not.toBeNull()
        if (!annotation) { return }
        original = annotation
      })

      it('sets isVisible to false', () => {
        const annotation = original.clone()
        annotation.hide(false)
        expect(annotation.isVisible).toBeFalsy()
      })

      it('commits workview/SHOW_ANNOTATION', () => {
        const annotation = original.clone()
        annotation.show(false)
        jest.spyOn(store, 'commit').mockReturnValue(undefined)

        annotation.hide(true)
        expect(annotation.isVisible).toBeFalsy()
        expect(store.commit).toBeCalledWith('workview/HIDE_ANNOTATION', annotation.id)
      })
    })
  })

  describe('Video Annotation', () => {
    let flaskAnnotationPayload: StageAnnotationPayload
    let annotationData: VideoDataPayload

    beforeEach(() => {
      annotationData = {
        frames: {
          0: {
            keyframe: true,
            polygon: { path: [{ x: 0, y: 0 }, { x: 10, y: 10 }] }
          }
        },
        sub_frames: {
          0: {
            keyframe: true,
            text: { text: 'Text1' }
          }
        },
        interpolated: false,
        interpolate_algorithm: 'linear-1.1',
        segments: [[0, 30]]
      }
      flaskAnnotationPayload = buildStageAnnotationPayload({
        annotation_class_id: flask.id,
        data: annotationData,
        id: 'flask_video_annotation',
        workflow_stage_id: stage.id,
        z_index: 1
      })
    })

    it('createFromDeserializable', () => {
      const annotation = Annotation.createFromDeserializable(
        editor.activeView,
        loadStageAnnotationPayload(flaskAnnotationPayload)
      )
      expect(annotation).toBeDefined()
      if (!annotation) { return }
      expect(annotation.id).toBe('flask_video_annotation')
      expect(annotation.classId).toBe(flask.id)
      expect(annotation.zIndex).toBe(1)
      expect(annotation.id).toEqual(expect.any(String))
      expect(annotation.data).toBeDefined()
      expect(annotation.workflowStageId).toBe(stage.id)
      expect(isVideoAnnotationData(annotation.data)).toBeTruthy()
      expect(annotation.isVideoAnnotation()).toBeTruthy()
    })
  })
})
