import Vue from 'vue'

import { EditorCursor } from '@/engine/EditorCursor'
import { PluginContext } from '@/engine/editor'
import { SubAnnotationTool } from '@/engine/managers'
import { Annotation, AnnotationData, isVideoSubAnnotations } from '@/engine/models'
import {
  setupPrimaryButtonPanning,
  setupTouchPanning,
  setupWASDPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { calcCentroidPoint } from '@/engine/utils'

import TextInput from './TextInput.vue'

interface TextTool extends SubAnnotationTool {
  mainDiv: HTMLDivElement | null;
  textInstance: any;
}

export const tool: TextTool = {
  mainDiv: null,
  textInstance: null,
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

    if (!this.textInstance) { return }

    this.textInstance.$data.masterAnnotation = annotation

    let existingInstanceId
    if (isVideoSubAnnotations(this.masterAnnotation.subAnnotations)) {
      const subs = context.editor.inferVideoSubAnnotations(this.masterAnnotation)
      existingInstanceId = subs.find(ann => ann.type === 'text')
    } else {
      existingInstanceId = this.masterAnnotation.subAnnotations
        .find(ann => ann.type === 'text')
    }

    if (!existingInstanceId) { return }

    // existingInstanceId.data is always AnnotationData
    this.textInstance.$data.text = (existingInstanceId.data as AnnotationData).text
  },

  activate (context: PluginContext) {
    setupPrimaryButtonPanning(context)
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
    contents.id = 'text-input'
    this.mainDiv.appendChild(contents)

    const Ctor = Vue.extend(TextInput)
    const unmountTextInstance = () => {
      this.deactivate(context)
    }

    this.textInstance = new Ctor({
      store: context.editor.store,
      data: { editor: context.editor }
    })

    context.editor.activeView.annotationsLayer.canvas.parentElement?.appendChild(this.mainDiv)
    // the mounting needs to be delayed for $mount to find the tag
    setTimeout(() => this.textInstance.$mount('#text-input'), 100)
    this.textInstance.$on('saved', unmountTextInstance)

    context.editor.activeView.annotationsLayer.changed()
  },

  deactivate (context: PluginContext) {
    if (this.mainDiv) {
      if (this.textInstance) {
        this.textInstance.$destroy()
        this.mainDiv.removeChild(this.textInstance.$el)
        this.textInstance = null
      }
      context.editor.activeView.annotationsLayer.canvas.parentElement?.removeChild(this.mainDiv)
      this.mainDiv = null
    }
    this.masterAnnotation = null
    context.editor.activeView.annotationsLayer.changed()
    context.editor.toolManager.activatePreviousToolEntry()
  },

  reset () { }
}
