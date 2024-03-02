import {
  addAnnotationAction,
  addOrUpdateImageSubAnnotationsAction,
  addOrUpdateVideoSubAnnotationsAction,
  changeAnnotationClass,
  deleteAnnotationAction
} from '@/engine/actions'
import { PluginContext } from '@/engine/editor'
import { EnginePlugin, enableInterpolateByDefault } from '@/engine/managers'
import {
  Annotation,
  isVideoSubAnnotations,
  VideoAnnotationData
} from '@/engine/models'
import { VideoAnnotationDataPayload } from '@/engine/models/views/types'
import { getInitialVideoAnnotationSegments } from '@/engine/utils/getInitialVideoAnnotationSegments'
import { AnnotationData } from '@/store/types'

interface CopyAndPastePlugin extends EnginePlugin {
  clipboard: Annotation | undefined
  videoAnnotationData: VideoAnnotationDataPayload
  inferredVideoAnnotationData: VideoAnnotationDataPayload
}

const clipboardPlugin: CopyAndPastePlugin = {
  clipboard: undefined,
  videoAnnotationData: {
    data: {},
    subs: [],
    keyframe: false,
    subkeyframe: false,
    interpolateAlgorithm: 'linear-1.1'
  },
  inferredVideoAnnotationData: {
    data: {},
    subs: [],
    keyframe: false,
    subkeyframe: false,
    interpolateAlgorithm: 'linear-1.1'
  },
  activate (context: PluginContext) {
    // manage annotations copy command (CTRL+C)
    context.registerCommand('clipboard.copy', () => {
      const selectedAnnotation = context.editor.selectedAnnotation
      if (!selectedAnnotation) { return }

      if (selectedAnnotation.isVideoAnnotation()) {
        this.videoAnnotationData = {
          data: Object.values(selectedAnnotation.data.frames)[0],
          subs: Object.values(selectedAnnotation.subAnnotations.frames)[0] || [],
          keyframe: false,
          subkeyframe: false,
          interpolateAlgorithm: selectedAnnotation.data.interpolate_algorithm
        }
        this.inferredVideoAnnotationData = selectedAnnotation.inferVideoData(
          context.editor.activeView
        )
      }

      this.clipboard = selectedAnnotation.clone()
    })

    context.registerCommand('clipboard.cut', () => {
      // manage annotations copy command (CTRL+X)
      if (!context.editor.activeView.hasCurrentItem) { return }
      const selectedAnnotation = context.editor.selectedAnnotation
      if (!selectedAnnotation) { return }

      if (selectedAnnotation.isVideoAnnotation()) {
        this.videoAnnotationData = selectedAnnotation.inferVideoData(context.editor.activeView)
      }

      this.clipboard = selectedAnnotation
      context.editor.actionManager.do(deleteAnnotationAction(context.editor, selectedAnnotation))
      context.editor.activeView.annotationsLayer.changed()
    })

    context.registerCommand('clipboard.paste', () => {
      // manage annotations copy command (CTRL+V)
      if (!this.clipboard) { return }
      const { activeView } = context.editor
      if (!activeView.hasCurrentItem) { return }

      const serializer = context.editor.serializerManager.getSerializer(this.clipboard.type)
      if (!serializer) { return }

      if (this.clipboard.subAnnotations && !isVideoSubAnnotations(this.clipboard.subAnnotations)) {
        const newAnnotation = this.clipboard.clone()

        /**
         * Increment z-index to avoid copied z-index value
         * that cause item ordering issue
         */
        if (newAnnotation.zIndex !== null) {
          newAnnotation.zIndex = Array.isArray(activeView.annotations)
            ? activeView.annotations.length + 1
            : 1
        }

        context.editor.actionManager.do(addAnnotationAction(context.editor, newAnnotation))
        context.editor.activeView.annotationsLayer.changed()
        return
      }

      // if it's a video, in case of DICOM split view, we must update frames
      // and segments to properly ofset onto pasted view

      const { data: annotationData, subs, interpolateAlgorithm } = this.videoAnnotationData
      const { frames } = this.clipboard.data

      const newSegments = getInitialVideoAnnotationSegments(context.editor)
      const segmentStart = newSegments[0][0]

      const newFrames: { [frame: string]: AnnotationData } = {
        [segmentStart]: annotationData
      }

      if (frames) {
        const framesKeys = Object.keys(frames)
        framesKeys.forEach((key) => {
          newFrames[key] = frames[key]
        })
      }

      const newData: VideoAnnotationData = {
        frames: newFrames,
        sub_frames: {},
        segments: newSegments,
        interpolated: enableInterpolateByDefault(
          context.editor.activeView.renderManager.rendererFor(this.clipboard.type)
        ),
        interpolate_algorithm: interpolateAlgorithm
      }

      const params = {
        type: this.clipboard.type,
        classId: this.clipboard.classId,
        actors: this.clipboard.actors,
        data: newData
      }

      const annotation = context.editor.initializeAnnotation(params)
      if (!annotation) { return }

      annotation.subAnnotations = { frames: { [activeView.currentFrameIndex]: subs } }
      context.editor.actionManager.do(addAnnotationAction(context.editor, annotation))
      context.editor.activeView.annotationsLayer.changed()
    })

    context.registerCommand('clipboard.shift_paste', () => {
      if (!this.clipboard) { return }
      if (!context.editor.activeView.hasCurrentItem) { return }

      const serializer = context.editor.serializerManager.getSerializer(this.clipboard.type)
      if (!serializer) { return }

      const annotation = context.editor.selectedAnnotation
      if (!annotation) { return }

      if (annotation.annotationClass?.id !== this.clipboard.annotationClass?.id) {
        context.editor.toast({
          message: 'Cannot paste sub-annotations to an annotation of a different class',
          isError: false
        })
        return
      }

      if (!isVideoSubAnnotations(this.clipboard.subAnnotations)) {
        context.editor.actionManager.do(
          addOrUpdateImageSubAnnotationsAction(
            context.editor,
            this.clipboard.subAnnotations,
            annotation
          )
        )
        context.editor.activeView.annotationsLayer.changed()
        return
      }

      if (!annotation.isVideoAnnotation()) {
        throw new Error('Clipboard: Expected annotation to be a video')
      }

      const { loadedVideo } = context.editor.activeView
      if (!loadedVideo) {
        throw new Error('Clipboard: Expected editor to have a video loaded')
      }

      context.editor.actionManager.do(
        addOrUpdateVideoSubAnnotationsAction(
          context.editor,
          this.inferredVideoAnnotationData.subs,
          annotation
        )
      )
      context.editor.activeView.annotationsLayer.changed()
    })

    context.registerCommand('clipboard.alt_paste', () => {
      const { clipboard } = this
      if (!clipboard) { return }
      if (!clipboard.annotationClass) { return }
      if (!context.editor.activeView.hasCurrentItem) { return }

      const serializer = context.editor.serializerManager.getSerializer(clipboard.type)
      if (!serializer) { return }

      const annotation = context.editor.selectedAnnotation
      if (!annotation) { return }
      if (!annotation.annotationClass) { return }

      const clipboardType =
        context.editor.getMainAnnotationTypeForClass(clipboard.annotationClass)
      const annotationType =
        context.editor.getMainAnnotationTypeForClass(annotation.annotationClass)

      if (clipboardType.id !== annotationType.id) {
        context.editor.toast({
          message: 'Cannot Copy to the annotation class with different main annotation type',
          isError: false
        })

        return
      }

      context.editor.actionManager.do(
        changeAnnotationClass(context.editor, annotation, clipboard.annotationClass)
      )
      context.editor.activeView.annotationsLayer.changed()
    })
  },
  deactivate (context: PluginContext) {
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default clipboardPlugin
