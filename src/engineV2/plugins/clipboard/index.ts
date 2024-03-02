import {
  addAnnotationAction,
  addOrUpdateImageSubAnnotationsAction,
  addOrUpdateVideoSubAnnotationsAction,
  changeAnnotationClass
} from '@/engineV2/actions'
import { enableInterpolateByDefault } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import {
  Annotation,
  isVideoSubAnnotations,
  VideoAnnotationData
} from '@/engineV2/models'
import { VideoAnnotationDataPayload, PluginContext } from '@/engineV2/types'
import {
  getInitialVideoAnnotationSegments
} from '@/engineV2/utils/getInitialVideoAnnotationSegments'
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
    context.registerCommand('clipboard.copy', () => {
      const selectedAnnotation = context.editor.activeView.annotationManager.selectedAnnotation
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
      if (context.editor.activeView.isLoading) { return }
      const selectedAnnotation = context.editor.activeView.annotationManager.selectedAnnotation
      if (!selectedAnnotation) { return }

      if (selectedAnnotation.isVideoAnnotation()) {
        this.videoAnnotationData = selectedAnnotation.inferVideoData(context.editor.activeView)
      }

      this.clipboard = selectedAnnotation
      context.editor
        .activeView
        .annotationManager
        .deleteAnnotationAction(selectedAnnotation)
    })

    context.registerCommand('clipboard.paste', () => {
      if (!this.clipboard) { return }
      const { activeView } = context.editor
      if (activeView.isLoading) { return }

      const serializer = context.editor.serializerManager.getSerializer(this.clipboard.type)
      if (!serializer) { return }

      if (this.clipboard.subAnnotations && !isVideoSubAnnotations(this.clipboard.subAnnotations)) {
        const newAnnotation = this.clipboard.clone()

        /**
         * Increment z-index to avoid copied z-index value
         * that cause item ordering issue
         */
        if (newAnnotation.zIndex !== null) {
          newAnnotation.zIndex = Array.isArray(activeView.annotationManager.annotations)
            ? activeView.annotationManager.annotations.length + 1
            : 1
        }

        context.editor.actionManager.do(addAnnotationAction(
          context.editor.activeView,
          newAnnotation
        ))
        if (FeatureFlagsManager.isOffLayerV2) {
          context.editor.activeView.annotationsLayer.changed()
        }
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

      const annotation = context.editor.activeView.annotationManager.initializeAnnotation(params)
      if (!annotation) { return }

      annotation.subAnnotations = { frames: { [activeView.currentFrameIndex]: subs } } as any
      context.editor.actionManager.do(addAnnotationAction(context.editor.activeView, annotation))
      if (FeatureFlagsManager.isOffLayerV2) {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.registerCommand('clipboard.shift_paste', () => {
      if (!this.clipboard) { return }
      if (context.editor.activeView.isLoading) { return }

      const serializer = context.editor.serializerManager.getSerializer(this.clipboard.type)
      if (!serializer) { return }

      const annotation = context.editor.activeView.annotationManager.selectedAnnotation
      if (!annotation) { return }

      if (annotation.annotationClass?.id !== this.clipboard.annotationClass?.id) {
        context.editor.store.dispatch(
          'toast/notify',
          { content: 'Cannot paste sub-annotations to an annotation of a different class' }
        )
        return
      }

      if (!isVideoSubAnnotations(this.clipboard.subAnnotations)) {
        context.editor.actionManager.do(
          addOrUpdateImageSubAnnotationsAction(
            context.editor.activeView,
            this.clipboard.subAnnotations,
            annotation
          )
        )
        if (FeatureFlagsManager.isOffLayerV2) {
          context.editor.activeView.annotationsLayer.changed()
        }
        return
      }

      if (!annotation.isVideoAnnotation()) {
        throw new Error('Clipboard: Expected annotation to be a video')
      }

      const { isLoading } = context.editor.activeView
      if (isLoading) {
        throw new Error('Clipboard: Expected editor to have a video loaded')
      }

      context.editor.actionManager.do(
        addOrUpdateVideoSubAnnotationsAction(
          context.editor.activeView,
          this.inferredVideoAnnotationData.subs as any,
          annotation
        )
      )
      if (FeatureFlagsManager.isOffLayerV2) {
        context.editor.activeView.annotationsLayer.changed()
      }
    })

    context.registerCommand('clipboard.alt_paste', () => {
      const { clipboard } = this
      if (!clipboard) { return }
      if (!clipboard.annotationClass) { return }
      if (context.editor.activeView.isLoading) { return }

      const serializer = context.editor.serializerManager.getSerializer(clipboard.type)
      if (!serializer) { return }

      const annotation = context.editor.activeView.annotationManager.selectedAnnotation
      if (!annotation) { return }
      if (!annotation.annotationClass) { return }

      const clipboardType =
        context.editor.activeView.annotationManager
          .getMainAnnotationTypeForClass(clipboard.annotationClass)
      const annotationType =
        context.editor.activeView.annotationManager
          .getMainAnnotationTypeForClass(annotation.annotationClass)

      if (clipboardType.id !== annotationType.id) {
        context.editor.store.dispatch(
          'toast/notify',
          { content: 'Cannot Copy to the annotation class with different main annotation type' }
        )

        return
      }

      context.editor.actionManager.do(
        changeAnnotationClass(
          context.editor.activeView.annotationManager,
          annotation,
          clipboard.annotationClass
        )
      )
      if (FeatureFlagsManager.isOffLayerV2) {
        context.editor.activeView.annotationsLayer.changed()
      }
    })
  },
  deactivate (context: PluginContext) {
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default clipboardPlugin
