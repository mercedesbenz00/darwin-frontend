/**
 * Notion Hotkeys documentation available at
 * https://www.notion.so/v7labs/Annotation-Workview-e8d26f8dd268433ab97d5860e476d04f
 *
 * HotkeyInfo/hotkeys.ts
 * - Describes all possible hotkeys with a short description to display in UI
 *
 * managers/hotkeyManager.ts
 * - Binds event listeners for all keyboard events (keydown, keypress, keyup)
 * - Define hotkeys and events that the editor should trigger on it
 *
 * plugins/mixins/setupPanning.ts
 * - defines utility functions to enable panning in workview
 */

import { isEqual } from 'lodash'

import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { Point } from '@/engineCommon/point'
import { addAnnotationAction } from '@/engineV2/actions'
import { Editor } from '@/engineV2/editor'
import { Annotation } from '@/engineV2/models'
import { hasAttributesSubAnnotation } from '@/engineV2/utils'
import { AnnotationActorPayload, AnnotationHotkeysPayload } from '@/store/types'
import { onMacOS } from '@/utils'

export type HotkeyListener = {
  listener: (event: KeyboardEvent, payload?: any) => void
  key?: string | string[]
  code?: string | string[]
  metaKey?: boolean
  type?: 'keydown' | 'keypress' | 'keyup'
  target?: EventTarget
  payload?: any
}

export type HotkeyListenerOptions = Pick<HotkeyListener, 'type' | 'payload' | 'target'>

export class HotkeyManager {
  public listeners: HotkeyListener[] = []
  private isTabActive: boolean = false
  private editor: Editor

  constructor (editor: Editor) {
    this.editor = editor
    this.listeners = []
    this.registerKeyEvents()
  }

  private datasetHotkeys: AnnotationHotkeysPayload = {}

  public setHotkeys (hotkeys: AnnotationHotkeysPayload): void {
    this.datasetHotkeys = hotkeys
  }

  /**
   * Register default editor hotkey listeners
   */
  public registerDefaultHotkeyListeners (): void {
    this.unregisterKeyEvents()
    this.registerKeyEvents()

    const { editor } = this

    // Keydown handlers

    // CAUTION: On some keyboard layouts,
    // hitting the key 'z' results in key: 'z', code: 'KeyY'
    // Using `key` is safer than code
    this.$on({ key: 'z', metaKey: true }, (event) => {
      event.preventDefault()
      event.shiftKey ? editor.actionManager.redo() : editor.actionManager.undo()
    })

    this.$on({ code: 'KeyH' }, (event) => {
      event.preventDefault()
      event.shiftKey
        ? editor.activeView.annotationManager.toggleSubAnnotations()
        : editor.activeView.annotationManager.toggleAnnotations()
    })

    this.$on({ code: 'KeyM', metaKey: true }, (event) => {
      event.preventDefault()
      editor.activeView.measureManager.toggleMeasures()
    })

    this.registerTabBehavior()

    this.$on({ code: 'ArrowUp' }, (event) => {
      event.preventDefault()
      editor.activeView.annotationManager.moveSelectedAnnotation(
        new Point<'Image'>({ x: 0, y: event.shiftKey ? -5 : -1 })
      )
    })

    this.$on({ code: 'ArrowDown' }, (event) => {
      event.preventDefault()
      editor.activeView.annotationManager.moveSelectedAnnotation(
        new Point<'Image'>({ x: 0, y: event.shiftKey ? 5 : 1 })
      )
    })

    this.$on({ code: 'ArrowLeft' }, (event) => {
      event.preventDefault()
      editor.activeView.annotationManager.moveSelectedAnnotation(
        new Point<'Image'>({ x: event.shiftKey ? -5 : -1, y: 0 })
      )
    })

    this.$on({ code: 'ArrowRight' }, (event) => {
      event.preventDefault()
      editor.activeView.annotationManager.moveSelectedAnnotation(
        new Point<'Image'>({ x: event.shiftKey ? 5 : 1, y: 0 })
      )
    })

    this.$on({ key: '`' }, (event) => {
      event.preventDefault()
      editor.activeView.annotationManager.selectNextVertex()
    })

    this.$on({ key: '~' }, (event) => {
      event.preventDefault()
      editor.activeView.annotationManager.selectPreviousVertex()
    })

    this.$on({ code: 'Escape' }, (event) => {
      event.preventDefault()
      editor.activeView.annotationManager.deselectAllAnnotations()
    })

    this.$on({ key: 'a', metaKey: true }, (event) => {
      event.preventDefault()
      const { selectedAnnotation } = editor.activeView.annotationManager
      if (selectedAnnotation && hasAttributesSubAnnotation(selectedAnnotation)) {
        editor.toolManager.activateToolWithStore(
          'attributes_tool',
          { sub: { master: selectedAnnotation } }
        )
      }
    })

    this.$on({}, (event) => editor.pluginManager.handleKeybindings(event, 'keydown'))
    this.$on({}, (event) => editor.toolManager.handleKeybindings(event))
    this.$on({}, (event) => editor.activeView.onOnKeyDownCallbacks.call(event))

    // Keypress handlers
    this.$on(
      {},
      (event) => editor.activeView.onOnKeyPressCallbacks.call(event),
      { type: 'keypress' }
    )

    // Keyup handlers
    this.$on(
      { code: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] },
      () => editor.activeView.annotationManager.performMoveAction(),
      { type: 'keyup' }
    )
    this.$on(
      {},
      (event) => editor.pluginManager.handleKeybindings(event, 'keyup'),
      { type: 'keyup' }
    )
    this.$on({}, (event) => editor.activeView.onOnKeyUpCallbacks.call(event), { type: 'keyup' })
  }

  registerTabBehavior (): void {
    const { editor } = this

    this.$on({ code: 'Tab' }, (event) => {
      this.isTabActive = true
      event.preventDefault()
    }, { type: 'keydown' })

    this.$on({ code: 'Tab' }, (event) => {
      this.isTabActive = false
      // If the key is held (`event.repeat === true`), just prevent the default
      // behaviour of the tab key
      event.preventDefault()
      if (editor.pluginManager.isWindowLevelPluginActive) { return }
      if (event.repeat) { return }

      // If the key is pressed, tab between vertices or annotations
      if (event.shiftKey) {
        const previousAnnotation = editor.activeView.annotationManager.selectPreviousAnnotation()
        if (previousAnnotation) {
          this.editor.activeView.zoomToAnnotation(previousAnnotation)
        }
      } else {
        const nextAnnotation = editor.activeView.annotationManager.selectNextAnnotation()
        if (nextAnnotation) {
          this.editor.activeView.zoomToAnnotation(nextAnnotation)
        }
      }
    }, { type: 'keyup' })
  }

  /**
   * Register annotation class hotkeys
   */
  public registerAnnotationClassHotkeys (): void {
    this.$on(
      { key: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] },
      (e) => this.isTabActive
        ? this.selectPresets(e)
        : this.selectAnnotationClass(e)
    )
  }

  /**
   * Select annotation class from the key event
   */
  private selectAnnotationClass (event: KeyboardEvent): void {
    const { toolManager } = this.editor
    const { annotationClasses } = this.editor.activeView.annotationManager
    const annotationClass = annotationClasses.find(
      aclass => this.datasetHotkeys[event.key] === `select_class:${aclass.id}`
    )

    if (!annotationClass) { return }
    if (
      this.editor.activeView.annotationManager.maybeChangeSelectedAnnotationClass(annotationClass)
    ) { return }

    const { name: typeName } =
      this.editor.activeView.annotationManager.getMainAnnotationTypeForClass(annotationClass)

    if (typeName === 'tag') {
      this.handleTagAnnotationClass(annotationClass)
      return
    }

    const tool = toolManager.findByMainAnnotationTypeName(typeName)

    if (!tool) { return }

    // If I am using brush/clicker and press a key for a polygon,
    // it should still keep me on the brush tool but switch the class
    if (
      !(
        toolManager.currentTool &&
        (
          ['auto_annotate_tool', 'brush_tool', 'clicker_tool']
            .includes(toolManager.currentTool.name)
        ) &&
        tool.name === 'polygon_tool'
      )
    ) {
      this.editor.toolManager.activateToolWithStore(tool.name)
    }

    this.editor.store.commit('workview/PRESELECT_CLASS_ID', annotationClass.id)
  }

  /**
   * Select image manipultation preset
   */
  private selectPresets (event: KeyboardEvent): void {
    const { presets } = this.editor.store.state.workview
    const selectedPreset = presets.find(preset => {
      return isEqual(preset.keys, ['Tab', event.key])
    })
    if (!selectedPreset?.id) { return }
    this.editor.store.commit(
      'workview/SET_ACTIVE_MANIPULATION_PRESET_ID',
      selectedPreset?.id
    )
  }

  public handleTagAnnotationClass (tagAnnotationClass: AnnotationClass): void {
    const { actionManager } = this.editor
    const { activeView } = this.editor
    const { annotations } = activeView.annotationManager

    const existingTagAnnotation = annotations
      .find(annotation => annotation.classId === tagAnnotationClass.id)

    // If annotation for this tag annotation class exists, remove it.
    // If not, add a new annotation.
    if (existingTagAnnotation) {
      activeView.annotationManager.deleteAnnotationAction(existingTagAnnotation)
      return
    }

    const currentUser = this.editor.store.state.user.profile
    if (!currentUser) { return }

    const actorPayload: AnnotationActorPayload = {
      role: 'annotator',
      user_id: currentUser.id
    }

    const { fileManager, store } = activeView
    let annotation: Annotation | null
    if (fileManager.isProcessedAsVideo) {
      const { videoAnnotationDuration } = store.state.workview
      annotation = this.editor.activeView.annotationManager.initializeAnnotation({
        type: 'tag',
        classId: tagAnnotationClass.id,
        actors: [actorPayload],
        data: {
          frames: { [activeView.currentFrameIndex]: { tag: { }, keyframe: true } },
          segments: [[activeView.currentFrameIndex, Math.min(
            activeView.currentFrameIndex + videoAnnotationDuration,
            activeView.totalFrames
          )]],
          interpolated: false
        }
      })
    } else {
      annotation = this.editor.activeView.annotationManager.initializeAnnotation({
        type: 'tag',
        actors: [actorPayload],
        classId: tagAnnotationClass.id,
        data: { tag: { } }
      })
    }

    if (!annotation) { return }
    actionManager.do(addAnnotationAction(this.editor.activeView, annotation))
  }

  /**
   * Clean up all the hotkey listeners
   */
  public cleanup (): void {
    this.unregisterKeyEvents()
    this.listeners = []
  }

  /**
   * Register a new hotkey listener
   */
  public $on (
    filter: { key?: string | string[], code?: string | string[], metaKey?: boolean },
    listener: HotkeyListener['listener'],
    options?: HotkeyListenerOptions
  ): void {
    this.listeners.push({ listener, ...filter, ...options })
  }

  /**
   * Deregister an existing hotkey listener
   */
  public $off (
    filter: { key?: string | string[], code?: string | string[], metaKey?: boolean },
    listener: HotkeyListener['listener']
  ): void {
    const idx = this.listeners.findIndex(hl =>
      hl.listener === listener &&
      isEqual(hl.key, filter.key) &&
      isEqual(hl.code, filter.code)
    )
    if (idx < 0) { return }

    this.listeners.splice(idx, 1)
  }

  private get keydownListeners (): HotkeyListener[] {
    // When type is undefined, it is keydown by default
    return this.listeners.filter(hl => (!hl.type || hl.type === 'keydown'))
  }

  private get keypressListeners (): HotkeyListener[] {
    return this.listeners.filter(hl => hl.type === 'keypress')
  }

  private get keyupListeners (): HotkeyListener[] {
    return this.listeners.filter(hl => hl.type === 'keyup')
  }

  private isMetaKey (event: KeyboardEvent): boolean {
    return (onMacOS() ? event.metaKey : event.ctrlKey)
  }

  /**
   * Check if the current keyboard event matches the hotkey listener conditions
   */
  private conditionMatches (event: KeyboardEvent, hotkeyListener: HotkeyListener): boolean {
    const metaKey = this.isMetaKey(event)

    if (hotkeyListener.target && hotkeyListener.target !== event.target) { return false }
    if (hotkeyListener.metaKey && !metaKey) { return false }

    if (!hotkeyListener.key && !hotkeyListener.code) {
      return true
    }

    if (hotkeyListener.key) {
      if (hotkeyListener.key instanceof Array && hotkeyListener.key.includes(event.key)) {
        return true
      }

      return hotkeyListener.key === event.key
    }

    if (hotkeyListener.code) {
      if (hotkeyListener.code instanceof Array && hotkeyListener.code.includes(event.code)) {
        return true
      }

      return hotkeyListener.code === event.code
    }

    return false
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.target) {
      // This bas been added to make the input work on workview
      // For now, we have search field on the class selection dropdown
      // In case of dropdown, we just ignore other handlers so that
      // Input can handle it on its own
      const elem = event.target as HTMLElement
      if (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA') { return }
    }

    this.keydownListeners.forEach(hl => {
      if (this.conditionMatches(event, hl)) {
        hl.listener(event, hl.payload)
      }
    })
  }

  private onKeyPress = (event: KeyboardEvent): void => {
    if (event.target) {
      // This bas been added to make the input work on workview
      // For now, we have search field on the class selection dropdown
      // In case of dropdown, we just ignore other handlers so that
      // Input can handle it on its own
      const elem = event.target as HTMLElement
      if (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA') { return }
    }

    this.keypressListeners.forEach(hl => {
      if (this.conditionMatches(event, hl)) {
        hl.listener(event, hl.payload)
      }
    })
  }

  private onKeyUp = (event: KeyboardEvent): void => {
    if (event.target) {
      const elem = event.target as HTMLElement
      if (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA') { return }
    }

    this.keyupListeners.forEach(hl => {
      if (this.conditionMatches(event, hl)) {
        hl.listener(event, hl.payload)
      }
    })
  }

  private registerKeyEvents (): void {
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keypress', this.onKeyPress)
    document.addEventListener('keyup', this.onKeyUp)
  }

  private unregisterKeyEvents (): void {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keypress', this.onKeyPress)
    document.removeEventListener('keyup', this.onKeyUp)
  }
}
