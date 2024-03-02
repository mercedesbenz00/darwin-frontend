import { ToolConfig, PluginConfig } from '@/engineV2/managers/pluginManagerInterfaces'
import { pixelBrush } from '@/engineV2/plugins'

const toolOptionAlwaysVisible = (): boolean => true

export const pixelBrushToolConfig: ToolConfig = {
  name: 'pixel_brush_tool',
  toolTip: `
    <b>Pixel Brush Tool <span class="tooltip__hotkey">F</span></b><br>
    <span>Increase size <span class="tooltip__hotkey">]</span></span><br>
    <span>Decrease size <span class="tooltip__hotkey">[</span></span><br>
    <span>Eraser <span class="tooltip__hotkey">E</span></span><br>
    <span>Quick eraser/brush switch <span class="tooltip__hotkey">Hold Shift</span></span>
  `,
  icon: 'brush',
  keybindings: [
    { keys: ['f'], action: ['pixel_brush_tool.activate', 'pixel_brush_tool.activate_brush'] },
    { keys: ['e'], action: ['pixel_brush_tool.activate', 'pixel_brush_tool.activate_eraser'] },
    { keys: ['['], action: 'pixel_brush_tool.shrink' },
    { keys: [']'], action: 'pixel_brush_tool.grow' },
    { keys: ['Escape'], action: 'pixel_brush_tool.cancel', when: 'active' },
  ],
  annotationTypes: ['mask'],
  sub: false,
  priority: 3,
  disabled: false,
  toolOptions: [
    {
      id: 'brush',
      tooltip: 'Pixel Brush <span class="tooltip__hotkey">F</span>',
      active: true,
      props: {},
      category: 'brush-mode',
      tabbed: true,
      action: 'pixel_brush_tool.activate_brush',
      isVisible: toolOptionAlwaysVisible
    },
    {
      id: 'eraser',
      tooltip: 'Eraser <span class="tooltip__hotkey">E</span>',
      active: false,
      props: {},
      category: 'brush-mode',
      tabbed: true,
      action: 'pixel_brush_tool.activate_eraser',
      isVisible: toolOptionAlwaysVisible
    },
    {
      id: 'brush-separator-1',
      class: 'separator',
      tooltip: '',
      active: false,
      props: {},
      tabbed: false,
      action: '',
      isVisible: toolOptionAlwaysVisible
    },
    {
      id: 'brush-size',
      tooltip: 'Brush tip size <span class="tooltip__hotkey">[ or ] to adjust</span>',
      active: false,
      props: { value: 10, commandName: 'pixel_brush_tool.set_brush_size' },
      tabbed: false,
      action: '',
      isVisible: toolOptionAlwaysVisible
    },
    {
      id: 'shrink',
      tooltip: '',
      active: false,
      props: {},
      category: 'brush-size',
      tabbed: false,
      action: 'pixel_brush_tool.shrink',
      isVisible: toolOptionAlwaysVisible
    },
    {
      id: 'grow',
      tooltip: '',
      active: false,
      props: {},
      category: 'brush-size',
      tabbed: false,
      action: 'pixel_brush_tool.grow',
      isVisible: toolOptionAlwaysVisible
    },
    {
      id: 'brush-separator-2',
      class: 'separator',
      tooltip: '',
      active: false,
      props: {},
      tabbed: false,
      action: '',
      isVisible: toolOptionAlwaysVisible
    },
    {
      id: 'round',
      tooltip: 'Round Tip',
      active: true,
      props: {},
      category: 'brush-tip-shape',
      tabbed: false,
      action: 'pixel_brush_tool.activate_round_tip',
      isVisible: toolOptionAlwaysVisible
    },
    {
      id: 'squared',
      tooltip: 'Squared Tip',
      active: false,
      props: {},
      category: 'brush-tip-shape',
      tabbed: false,
      action: 'pixel_brush_tool.activate_squared_tip',
      isVisible: toolOptionAlwaysVisible
    }
  ]
}

export const pixelBrushConfig: PluginConfig = {
  plugin: pixelBrush,
  type: '?',
  name: 'pixel_brush',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [pixelBrushToolConfig]
}
