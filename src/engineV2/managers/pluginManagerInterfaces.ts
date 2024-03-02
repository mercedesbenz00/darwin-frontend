import { ToolBarButtonIconName } from '@/components/WorkView/ToolBar/ToolBarButton/types'
import { Editor } from '@/engineV2/editor'
import { Keybinding } from '@/engineV2/keybinding'
import { PluginContext } from '@/engineV2/types/PluginContext'
import { AnnotationTypeName, } from '@/store/types'

export interface EnginePlugin {
  activate(context: PluginContext): void
  deactivate(context: PluginContext): void
}

export interface ToolOption {
  id: string
  class?: string
  active: boolean
  tooltip: string
  props: object
  category?: string
  tabbed: boolean
  action: string
  isVisible: (editor?: Editor) => boolean
}

export interface ToolConfig {
  name: string
  priority?: number
  toolTip: string
  icon: ToolBarButtonIconName
  keybindings: Keybinding[]
  annotationTypes: AnnotationTypeName[]
  sub: boolean
  disabled: boolean,
  toolOptions?: ToolOption[]
}

export interface SubToolConfig {
  name: string
  priority?: number
  icon: ToolBarButtonIconName
  keybindings: Keybinding[]
  annotationTypes: AnnotationTypeName[]
  sub: boolean
  disabled: boolean,
  toolOptions?: []
}

export interface PluginConfig {
  plugin: EnginePlugin | undefined
  type: string
  name: string
  version: string
  active: boolean
  keybindings: Keybinding[]
  context: PluginContext | undefined
  tools: (ToolConfig | SubToolConfig)[]
}
