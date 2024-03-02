import Vue from 'vue'

import { EditorCursor } from '@/engineV2/EditorCursor'
import { SubAnnotationTool } from '@/engineV2/managers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation, AnnotationData, isVideoSubAnnotations } from '@/engineV2/models'
import {
  setupTouchPanning,
  setupWASDPanning,
  setupWheelPanning,
  setupZoom
} from '@/engineV2/plugins/mixins'
import { PluginContext } from '@/engineV2/types'
import { calcCentroidPoint } from '@/engineV2/utils'

import InstanceIdInput from './InstanceIdInput.vue'

interface InstanceIDTool extends SubAnnotationTool {
  mainDiv: HTMLDivElement | null;
  instanceIDInstance: any;
}

export const tool: InstanceIDTool = {
  mainDiv: null,
  instanceIDInstance: null,
  masterAnnotation: null,

  selectMasterAnnotation (context: PluginContext, annotation: Annotation) {
    this.masterAnnotation = annotation

    let actualAnnotation = annotation
    if (annotation.isVideoAnnotation()) {
      const { data: annotationData } = annotation.inferVideoData(context.editor.activeView)
      if (Object.keys(annotationData).length === 0) { return }
      actualAnnotation = annotation.shallowClone({ data: annotationData })
    }

    const centroid = calcCentroidPoint(context.editor.activeView, actualAnnotation)
    if (centroid && this.mainDiv) {
      this.mainDiv.style.visibility = 'visible'
      this.mainDiv.style.left = `${centroid.x + 80}px`
      this.mainDiv.style.top = `${Math.max(0, centroid.y - 30)}px`
    }

    if (!this.instanceIDInstance) { return }

    this.instanceIDInstance.$data.masterAnnotation = annotation

    let existingText
    if (isVideoSubAnnotations(this.masterAnnotation.subAnnotations)) {
      const subs =
        context.editor.activeView.annotationManager.inferVideoSubAnnotations(this.masterAnnotation)
      existingText = subs.find(ann => ann.type === 'instance_id')
    } else {
      existingText = this.masterAnnotation.subAnnotations
        .find(ann => ann.type === 'instance_id')
    }

    if (!existingText) { return }

    // existingText.data is always AnnotationData
    this.instanceIDInstance.$data.value = (existingText.data as AnnotationData).value || ''
  },

  activate (context: PluginContext) {
    setupWheelPanning(context)
    setupTouchPanning(context)
    setupWASDPanning(context)
    setupZoom(context)

    context.editor.selectCursor(EditorCursor.Pointer)

    this.mainDiv = document.createElement('div')
    this.mainDiv.style.width = '200px'
    this.mainDiv.style.height = '32px'
    this.mainDiv.style.backgroundColor = 'transparent'
    this.mainDiv.style.position = 'absolute'
    this.mainDiv.style.zIndex = '1'
    this.mainDiv.style.visibility = 'hidden'
    const contents = document.createElement('div')
    contents.id = 'instance-id-input'
    this.mainDiv.appendChild(contents)

    const Ctor = Vue.extend(InstanceIdInput)
    const unmountTextInstance = () => {
      this.deactivate(context)
    }

    this.instanceIDInstance = new Ctor({
      store: context.editor.store,
      data: { editor: context.editor }
    })

    context.editor.activeView.annotationsLayer.canvas.parentElement?.appendChild(this.mainDiv)
    // the mounting needs to be delayed for $mount to find the tag
    setTimeout(() => this.instanceIDInstance.$mount('#instance-id-input'), 100)
    this.instanceIDInstance.$on('saved', unmountTextInstance)
    if (FeatureFlagsManager.isOffLayerV2) {
      context.editor.activeView.annotationsLayer.changed()
    }
  },

  deactivate (context: PluginContext) {
    if (this.mainDiv) {
      if (this.instanceIDInstance) {
        this.instanceIDInstance.$destroy()
        this.mainDiv.removeChild(this.instanceIDInstance.$el)
        this.instanceIDInstance = null
      }
      context.editor.activeView.annotationsLayer.canvas.parentElement?.removeChild(this.mainDiv)
      this.mainDiv = null
    }
    this.masterAnnotation = null
    if (FeatureFlagsManager.isOffLayerV2) {
      context.editor.activeView.annotationsLayer.changed()
    }
    context.editor.toolManager.activatePreviousToolEntry()
  },

  reset () { }
}
