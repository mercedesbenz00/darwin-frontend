import { ToolBarButtonIconName } from '@/components/WorkView/ToolBar/ToolBarButton/types'
import { EditorCursor } from '@/engine/EditorCursor'
import { Editor } from '@/engine/editor'
import { keybindingMatch } from '@/engine/keybinding'
import { Annotation } from '@/engine/models/annotation'
import { CallbackHandle } from '@/engineCommon/callbackHandler'
import { AnnotationTypeName } from '@/store/types'

import { ToolConfig, SubToolConfig } from './pluginManager'

export interface ToolContext {
  editor: Editor;
  handles: CallbackHandle[];
};

export interface Tool {
  activate(context: ToolContext): void
  deactivate(context: ToolContext): void
  reset(context: ToolContext): void
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
 * Note: We can not use ToolEntry, since it contains context,
 * which contains the engine. This causes a circular dependency that breaks reactivity.
 */
export interface ToolInfo {
  readonly name: string;
  toolTip: string;
  readonly active: boolean;
  readonly icon: ToolBarButtonIconName;
}

export class ToolManager {
  private toolEntries: ToolEntry[] = [];
  private previousToolEntry?: ToolEntry;
  private editor: Editor;

  constructor (editor: Editor) {
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
    const { selectedAnnotation } = editor
    if (currentTool) {
      const toolConfig = currentTool.toolConfig

      // If the current tool is edit tool, return the current annotation's annotation types
      if (currentTool.name === 'edit_tool' && selectedAnnotation?.annotationClass) {
        const mainAnnotationType = this.editor.getMainAnnotationTypeForClass(
          selectedAnnotation.annotationClass
        )
        return [mainAnnotationType.name]
      }

      return toolConfig.annotationTypes
    }
    return []
  }

  /**
   * Lists all registered tools
   */
  public get availableTools (): ToolInfo[] {
    const mainTools = this.toolEntries
      .filter(tool => {
        const { selectedDatasetItem } = this.editor.store.state.workview
        if (selectedDatasetItem?.status === 'complete') {
          const completeStageTools = ['edit_tool', 'commentator', 'zoom_tool']

          return !tool.toolConfig.sub && completeStageTools.includes(tool.name)
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
    return mainTools.map(entry => {
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

  public registerTool (name: string, tool: Tool, toolConfig: ToolConfig | SubToolConfig) {
    if (this.getToolEntry(name) !== null) { this.unregisterTool(name) }

    if (toolConfig.name !== name) {
      console.warn(`Registering tool with name '${name}' but config name '${toolConfig.name}'`)
      return
    }

    const { editor } = this

    editor.registerCommand(`${name}.activate`, () => editor.activateTool(name))

    const context = { editor, handles: [] }
    this.toolEntries.push({ active: false, context, name, tool, toolConfig })
  }

  public unregisterTool (name: string) {
    const entryIndex = this.toolEntries.findIndex(tool => tool.name === name)
    if (entryIndex === -1) { return }

    const entry = this.toolEntries[entryIndex]
    if (entry.active) { this.deactivateToolEntry(entry) }

    this.toolEntries.splice(entryIndex, 1)

    this.editor.unregisterCommand(`${name}.activate`)
  }

  public deactivateToolEntry (entry: ToolEntry) {
    entry.tool.deactivate(entry.context)
    entry.active = false
    for (const handle of entry.context.handles) {
      handle.release()
    }
  }

  public deactivateTool (name: string) {
    const entry = this.getToolEntry(name)
    if (!entry) { return }
    this.deactivateToolEntry(entry)
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

  public handleKeybindings (event: KeyboardEvent) {
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
      this.editor.activateTool(this.previousToolEntry.name)
      this.previousToolEntry = undefined
    }
  }
}
