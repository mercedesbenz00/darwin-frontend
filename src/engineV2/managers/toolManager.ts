import { EventEmitter } from 'events'

import { ToolBarButtonIconName } from '@/components/WorkView/ToolBar/ToolBarButton/types'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { CallbackHandle } from '@/engineCommon/callbackHandler'
import { EditorCursor } from '@/engineV2/EditorCursor'
import { Editor } from '@/engineV2/editor'
import { keybindingMatch } from '@/engineV2/keybinding'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation } from '@/engineV2/models/annotation'
import { isSubAnnotationTool } from '@/engineV2/utils'
import { View } from '@/engineV2/views'
import {
  AnnotationTypeName,
  V2DatasetItemPayload
} from '@/store/types'

import { ToolConfig, SubToolConfig } from './pluginManagerInterfaces'

// Available tool state to share
export type SharedToolState = {
  isPanning?: boolean
}

export interface ToolContext {
  editor: Editor;
  handles: CallbackHandle[];
};

export interface Tool {
  activate(context: ToolContext): void
  deactivate(context: ToolContext): void
  reset(context: ToolContext): void
  draw?(view: View, context?: ToolContext): void
  /**
   * Implements the logic that delegates the tool to decide whether
   * an annotation should be rendered or not.
   */
  shouldRender?(annotation: Annotation): boolean
  /**
   * Implements the logic that delegates the tool to decide whether
   * an annotation is being drawn when the fucntion is called.
   */
  isDrawing?(): boolean
  /**
   * Implements the logic that delegates the tool to save the currently
   * drawn annotation.
   */
  confirmCurrentAnnotation?(context: ToolContext): void
}

export interface SubAnnotationTool extends Tool {
  masterAnnotation: Annotation | null;
  selectMasterAnnotation(context: ToolContext, annotation: Annotation): void
}

export interface SubAnnotationToolPayload {
  master: Annotation
}

export interface ToolEntry {
  tool: Tool;
  toolConfig: ToolConfig | SubToolConfig;
  name: string;
  context: ToolContext;
  active: boolean;
};

/**
 * ToolInfo has all info the UI need to display the tool
 * The visibility property can be set to show/hide the tooltip.
 *
 * Note: We can not use ToolEntry, since it contains context, which contains the engine.
 * This causes a circular dependency that breaks reactivity.
 */
export interface ToolInfo {
  readonly name: string;
  toolTip: string;
  readonly active: boolean;
  readonly icon: ToolBarButtonIconName;
}

export const consensusAnnotationSupportedTools = [
  'bounding_box_tool',
  'polygon_tool',
  'auto_annotate_tool',
  'brush_tool',
  'commentator',
  'edit_tool',
]
/**
 * availableTools:changed
 * tool:activated
 */
export class ToolManager extends EventEmitter {
  private toolEntries: ToolEntry[] = [];
  private previousToolEntry?: ToolEntry;
  private editor: Editor;

  /**
   * Lists all registered tools
   *
   * @event availableTools:changed
   * @property {ToolInfo[]} availableTools
   */
  private _availableTools: ToolInfo[] = []

  get availableTools (): ToolInfo[] {
    return this._availableTools
  }

  private set availableTools (value: ToolInfo[]) {
    this._availableTools = value
    this.emit('availableTools:changed', this._availableTools)
  }

  constructor (editor: Editor) {
    super()

    this.editor = editor
  }

  /**
   * The current tool selected, null if no tool is currently select
   */
  public get currentTool (): ToolEntry | null {
    for (const entry of this.toolEntries) {
      if (entry.active) {
        return entry
      }
    }
    return null
  }

  /**
   * Array of annotation type names supported by current tool,
   * empty array when no tool is currently selected
   */
  public currentAnnotationTypes (): AnnotationTypeName[] {
    const { currentTool, editor } = this
    const { selectedAnnotation } = editor.activeView.annotationManager
    if (currentTool) {
      // If the current tool is edit tool, return the current annotation's annotation types
      if (currentTool.name === 'edit_tool' && selectedAnnotation?.annotationClass) {
        const mainAnnotationType = this.editor.store.getters['aclass/mainAnnotationTypeForClass'](
          selectedAnnotation.annotationClass
        )
        return [mainAnnotationType.name]
      }
      if (FeatureFlagsManager.isOnRasters) {
        if (currentTool.name === 'polygon_tool' || currentTool.name === 'brush_tool') {
          currentTool?.toolConfig?.annotationTypes.push('mask')
        }
      }

      const toolConfig = currentTool.toolConfig

      return toolConfig.annotationTypes
    }
    return []
  }

  defineAvailableTools (currentDatasetItem: V2DatasetItemPayload | null): void {
    const rootState = this.editor.store.state
    const workflowItemState = rootState.workview.v2WorkflowItemState
    const stageInstance = workflowItemState?.current_stage_instances?.find(
      (csi) => csi.user_id === rootState.user.profile?.id
    )
    const isWithinConsensus = this.editor.store.getters[
      'dataset/allConsensusStagesIds'
    ].includes(stageInstance?.stage_id ?? '')

    const mainTools = this.toolEntries
      .filter(tool => {
        const isMarkedAsReady =
          isWithinConsensus && stageInstance?.data.active_edge !== null

        const isReadonly =
          currentDatasetItem?.status === 'complete' ||
          isMarkedAsReady ||
          this.editor.activeView.readonly

        if (isReadonly) {
          const completeStageTools = ['select_tool', 'commentator', 'zoom_tool']

          return !tool.toolConfig.sub && completeStageTools.includes(tool.name)
        }
        if (isWithinConsensus) {
          return !tool.toolConfig.sub && consensusAnnotationSupportedTools.includes(tool.name)
        }

        return !tool.toolConfig.sub
      })
      .sort((a: ToolEntry, b: ToolEntry) => {
        /*
          - Sort the tools with priority first
          - Place the tools without priority after them
        */
        if (a.toolConfig.priority && !b.toolConfig.priority) { return 1 }
        if (!a.toolConfig.priority && b.toolConfig.priority) { return -1 }
        if (a.toolConfig.priority && b.toolConfig.priority) {
          return a.toolConfig.priority - b.toolConfig.priority
        }
        return 0
      })

    this.availableTools = mainTools.map(entry => {
      const { active, name } = entry

      // TODO: This is potentially dangerous casting.
      // Investigate if entry.toolConfig could be of type SubToolConfig
      const toolConfig = entry.toolConfig as ToolConfig
      const { icon, toolTip } = toolConfig

      return { active, icon, name, toolTip }
    })
  }

  /**
   * Get tool by name
   * @param name name of the tool
   */
  public findByName (name: string): ToolEntry | undefined {
    return this.toolEntries.find(entry => entry.name === name)
  }

  /**
   * Get tool by annotation type name
   * @param typeNAme annotation type name
   */
  public findByMainAnnotationTypeName (typeName: string): ToolEntry | undefined {
    if (typeName === 'cuboid') {
      return this.findByName('bounding_box_3d_tool')
    }

    if (typeName === 'line') {
      return this.findByName('polyline_tool')
    }

    return this.findByName(`${typeName}_tool`)
  }

  /**
   * Registers a new tool for a given name.
   * Registering a tool makes it visible in availableTools and activateTool
   *
   * @param name the name of the tool, needs to be unique
   * @param tool implementation of the tool
   */

  public registerTool (name: string, tool: Tool, toolConfig: ToolConfig | SubToolConfig): void {
    if (this.getToolEntry(name) !== null) { this.unregisterTool(name) }

    if (toolConfig.name !== name) {
      console.warn(`Registering tool with name '${name}' but config name '${toolConfig.name}'`)
      return
    }

    const { editor } = this

    editor.registerCommand(`${name}.activate`, () => this.activateToolWithStore(name))

    const context = { editor, handles: [] }
    this.toolEntries.push({ active: false, context, name, tool, toolConfig })

    this.defineAvailableTools(this.editor.itemManager.currentItem)
  }

  public unregisterTool (name: string): void {
    const entryIndex = this.toolEntries.findIndex(tool => tool.name === name)
    if (entryIndex === -1) { return }

    const entry = this.toolEntries[entryIndex]
    if (entry.active) { this.deactivateToolEntry(entry) }

    this.toolEntries.splice(entryIndex, 1)

    this.defineAvailableTools(this.editor.itemManager.currentItem)

    this.editor.unregisterCommand(`${name}.activate`)
  }

  public deactivateToolEntry (entry: ToolEntry): void {
    entry.tool.deactivate(entry.context)
    entry.active = false
    for (const handle of entry.context.handles) {
      handle.release()
    }
  }

  public deactivateTool (name: string): void {
    const entry = this.getToolEntry(name)
    if (!entry) { return }
    this.deactivateToolEntry(entry)
  }

  public activateToolWithStore (name: string, payload?: { sub: SubAnnotationToolPayload }): void {
    const { currentTool: tool } = this
    if (tool && tool.name === name) {
      if (isSubAnnotationTool(tool.tool) && payload) {
        const { master: masterAnnotation } = payload.sub
        if (tool.tool.masterAnnotation !== masterAnnotation) {
          tool.tool.selectMasterAnnotation(tool.context, masterAnnotation)
        }
      }
      return
    }

    this.activateTool(name, payload)

    if (name !== 'brush_tool') {
      this.editor.activeView.annotationManager.deselectAllAnnotations()
    }

    const newTool = this.currentTool
    if (!newTool) { return }

    this.editor.store.commit('workview/SET_CURRENT_TOOL', newTool.name)

    const types = this.currentAnnotationTypes()
    this.editor.store.commit('workview/SET_TOOL_ANNOTATION_TYPES', types)

    this.autoSelectClass()

    if (FeatureFlagsManager.isOffLayerV2) {
      this.editor.activeView.annotationsLayer.changed()
    }
  }

  /**
   * Activates a tool by calling it's activate function.
   * If another tool is already active, it will be deactivated.
   * If the tool is already active, nothing happens.
   *
   * @param name tool to active
   */
  public activateTool (
    name: string,
    payload: {sub: SubAnnotationToolPayload} | undefined = undefined
  ): void {
    const entry = this.getToolEntry(name)
    if (!entry || entry.toolConfig.disabled) { return }

    this.toolEntries.forEach((entry) => {
      if (entry.name !== name && entry.active) {
        this.previousToolEntry = entry
        this.deactivateToolEntry(entry)
        // Reset the cursor from the previous tool.
        this.editor.selectCursor(EditorCursor.Default)
      }
    })

    if (entry) {
      if (!entry.active) {
        entry.tool.activate(entry.context)
        entry.active = true
      }

      if (payload && payload.sub) {
        const subAnnotationTool = entry.tool as SubAnnotationTool
        if (subAnnotationTool) {
          subAnnotationTool.selectMasterAnnotation(entry.context, payload.sub.master)
        }
      }

      this.emit('tool:activated', name)
    } else {
      console.warn(`Tool with name '${name}' is not registered`)
    }
  }

  private getToolEntry (name: string): ToolEntry | null {
    for (const entry of this.toolEntries) {
      if (entry.name === name) {
        return entry
      }
    }
    return null
  }

  public handleKeybindings (event: KeyboardEvent): void {
    for (const entry of this.toolEntries) {
      for (const keybinding of entry.toolConfig.keybindings) {
        if (keybinding.when) {
          // only send the call if the tool is active.
          if (keybinding.when === 'active' && !entry.active) { continue }
        }
        if (keybindingMatch(event, keybinding.keys)) {
          if (typeof keybinding.action === 'string') {
            this.editor.callCommand(keybinding.action)
          } else {
            for (const action of keybinding.action) {
              this.editor.callCommand(action)
            }
          }
          event.preventDefault()
        }
      }
    }
  }

  public activatePreviousToolEntry (): void {
    if (this.previousToolEntry) {
      this.activateToolWithStore(this.previousToolEntry.name)
      this.previousToolEntry = undefined
    }
  }

  /**
   * Automatically activates appropriate tool in the editor
   *
   * This happens upon tool selection from sidebar, or class selection from top
   * bar.
   */
  public autoActivateTool (): void {
    const { preselectedAnnotationClass } = this.editor.activeView.annotationManager
    if (!preselectedAnnotationClass) { return }
    this.activateToolForType(preselectedAnnotationClass)
  }

  private activateToolForType (annotationClass: AnnotationClass): void {
    const type =
      this.editor.activeView.annotationManager.getMainAnnotationTypeForClass(annotationClass)

    const tools: ToolInfo[] = []
    for (const plugin of this.editor.pluginManager.installedPlugins) {
      for (const tool of plugin.tools) {
        if (!tool.annotationTypes.includes(type.name)) { continue }
        const entry = this.editor.toolManager.availableTools.find(t => t.name === tool.name)
        if (!entry) { continue }
        tools.push(entry)
      }
    }

    const currentTool = this.editor.toolManager.currentTool
    if (tools.length === 0) { return }
    // This way we are prioritizing picking the current tool if possible
    const tool = tools.find(t => currentTool && t.name === currentTool.name) || tools[0]
    this.editor.store.commit(
      'workview/PRESELECT_CLASS_ID_FOR_TOOL',
      { classId: annotationClass.id, tool: tool.name }
    )
    this.activateToolWithStore(tool.name)
  }

  /**
   * Activate a ToolOption by ID.
   * If that ToolOption belongs to any category,
   * deactivate all the other ToolOptions in that category.
   *
   * @param toolOptionId the ID of the ToolOption to be activated
   */
  public activateToolOption (toolOptionId: string): void {
    const { currentTool: tool } = this
    if (!tool) { return }

    const optionByName = (tool.toolConfig.toolOptions || [])
      .find(option => option.id === toolOptionId)
    if (!optionByName) { return }

    const { category } = optionByName
    if (category) {
      (tool.toolConfig.toolOptions || [])
        .filter(toolOption => toolOption.category === category)
        .forEach(toolOption => { toolOption.active = false })
    }

    optionByName.active = true
  }

  public deactivateToolOption (toolOptionId: string): void {
    const { currentTool: tool } = this
    if (!tool) { return }

    const optionByName = (tool.toolConfig.toolOptions || [])
      .find(option => option.id === toolOptionId)
    if (!optionByName) { return }

    optionByName.active = false
  }

  public deactivateToolOptions (): void {
    const { currentTool: tool } = this
    if (!tool) { return }
    if (!tool.toolConfig.toolOptions) { return }

    tool.toolConfig.toolOptions.forEach(toolOption => { toolOption.active = false })
  }

  public setToolOptionProps (name: string, props: object): void {
    const { currentTool: tool } = this
    if (!tool) { return }

    const toolOption = (tool.toolConfig.toolOptions || []).find(option => option.id === name)
    if (!toolOption) { return }

    toolOption.props = props
  }

  private autoSelectClass (): void {
    const { selectedAnnotation } = this.editor.activeView.annotationManager
    const { currentTool } = this
    if (currentTool && currentTool.name === 'edit_tool') {
      const types = this.currentAnnotationTypes()
      this.editor.store.commit('workview/SET_TOOL_ANNOTATION_TYPES', types)

      if (selectedAnnotation) {
        this.editor.store.commit(
          'workview/PRESELECT_CLASS_ID_WITHOUT_TOOL_CHANGE',
          selectedAnnotation.classId
        )
      }
    }
  }

  cleanup (): void {
    this._availableTools = []
  }
}
