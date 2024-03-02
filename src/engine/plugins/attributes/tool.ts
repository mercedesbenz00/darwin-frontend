import { Vue } from 'vue-property-decorator'

import { EditorCursor } from '@/engine/EditorCursor'
import { PluginContext } from '@/engine/editor'
import {
  SubAnnotationTool
} from '@/engine/managers'
import {
  Annotation
} from '@/engine/models'
import {
  setupPrimaryButtonPanning,
  setupTouchPanning,
  setupWASDPanning,
  setupZoom
} from '@/engine/plugins/mixins'
import { calcCentroidPoint } from '@/engine/utils'

import AttributesInput from './AttributesInput.vue'
import { getTagsFromAnnotation } from './utils'

interface AttributesTool extends SubAnnotationTool {
  mainDiv: HTMLDivElement | null;
  attributeInstance: Vue & { setInputFocus: () => void } | null;
}

export const tool: AttributesTool = {
  mainDiv: null,
  attributeInstance: null,
  masterAnnotation: null,

  selectMasterAnnotation (context: PluginContext, annotation: Annotation) {
    const { activeView } = context.editor

    this.masterAnnotation = annotation

    let actualAnnotation = annotation
    if (annotation.isVideoAnnotation()) {
      const { data: annotationData } = annotation.inferVideoData(activeView)
      if (Object.keys(annotationData).length === 0) { return }
      actualAnnotation = annotation.shallowClone({ data: annotationData })
    }

    const centroid = calcCentroidPoint(activeView, actualAnnotation)
    if (centroid && this.mainDiv) {
      this.mainDiv.style.visibility = 'visible'

      this.mainDiv.style.left = `${centroid.x + 80}px`
      this.mainDiv.style.top = `${Math.max(0, centroid.y - 30)}px`
    }

    if (this.attributeInstance) {
      this.attributeInstance.$data.masterAnnotation = annotation
      this.attributeInstance.setInputFocus()
    }

    const tags = getTagsFromAnnotation(this.masterAnnotation, context.editor)

    if (this.attributeInstance) {
      this.attributeInstance.$data.tags.length = 0
      this.attributeInstance.$data.tags.unshift(...tags)
    }
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
    contents.id = 'attribute-input'
    this.mainDiv.appendChild(contents)

    const Ctor = Vue.extend(AttributesInput)
    this.attributeInstance = new Ctor({
      store: context.editor.store,
      data: { editor: context.editor }
    })

    context.editor.activeView.annotationsLayer.canvas.parentElement?.appendChild(this.mainDiv)
    // the mounting needs to be delayed for $mount to find the tag
    const mountPoint = this.mainDiv.querySelector('#attribute-input')
    if (!mountPoint) { throw new Error('No mount point') }

    const { attributeInstance } = this
    attributeInstance.$mount(mountPoint)
    attributeInstance.$on('hide', () => {
      this.deactivate(context)
    })

    context.handles.push(...context.editor.onMouseUp(() => { this.deactivate(context) }))

    context.editor.activeView.annotationsLayer.changed()
  },

  deactivate (context: PluginContext) {
    const { attributeInstance, mainDiv } = this
    if (mainDiv) {
      if (attributeInstance) {
        attributeInstance.$destroy()
        this.attributeInstance = null
      }
      context.editor.activeView.annotationsLayer.canvas.parentElement?.removeChild(mainDiv)

      this.mainDiv = null
    }

    this.masterAnnotation = null
    context.editor.activeView.annotationsLayer.changed()
    context.editor.toolManager.activatePreviousToolEntry()
  },

  reset () { }
}
