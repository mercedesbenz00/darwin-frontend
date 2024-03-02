import Vue from 'vue'
import { VueConstructor } from 'vue/types/umd'

import { Editor } from '@/engineV2/editor'
import { keybindingMatch } from '@/engineV2/keybinding'
import {
  Serializer,
  Tool,
  MeasureOverlayer,
  AnnotationOverlayer
} from '@/engineV2/managers'
import { MainAnnotationTypeRenderer, RasterTypeRenderer } from '@/engineV2/models'
import {
  attributesPlugin,
  boundingBox,
  boundingBox3d,
  brush,
  clicker,
  clipboardPlugin,
  commentatorPlugin,
  directionalVector,
  editPlugin,
  ellipse,
  fieldPlugin,
  inferencePlugin,
  instanceIDPlugin,
  keypoint,
  link,
  magnifierGlass,
  mask,
  measuresPlugin,
  polygon,
  polyline,
  saveAnnotations,
  selectPlugin,
  skeleton,
  tablePlugin,
  tag,
  textPlugin,
  v7Look,
  videoPlayerPlugin,
  windowLevelPlugin,
  WindowLevelPlugin,
  zoomPlugin,
  zoomCorrection
} from '@/engineV2/plugins'
import { DatasetPayload } from '@/store/types'

import { FeatureFlagsManager } from './featureFlagsManager'
import { pixelBrushConfig, pixelBrushToolConfig } from './pluginConfig/pixelBrushConfig'
import { PluginConfig, ToolConfig, SubToolConfig } from './pluginManagerInterfaces'

const toolOptionAlwaysVisible = (): boolean => true

const zoomCorrectionConfig: PluginConfig = {
  plugin: zoomCorrection,
  type: '?',
  name: 'zoom_correction',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [
    { keys: ['ctrl', 'U'], action: 'zoom_correction.in' },
    { keys: ['ctrl', 'I'], action: 'zoom_correction.out' }
  ],
  tools: []
}

const magnifierGlassConfig: PluginConfig = {
  plugin: magnifierGlass,
  type: '?',
  name: 'magnifier_glass',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [{ keys: ['ctrl', 'g'], action: 'magnifier_glass.toggle' }],
  tools: []
}

const v7LookConfig: PluginConfig = {
  plugin: v7Look,
  type: '?',
  name: 'v7',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [{ keys: ['ctrl', '/'], action: 'v7.toggle' }],
  tools: []
}

const editToolConfig: ToolConfig = {
  name: 'edit_tool',
  toolTip: `
    <b>Edit Tool <span class="tooltip__hotkey">V</span></b><br>
    <span>Select annotations or paths <span class="tooltip__hotkey">Click</span></span><br>
    <span>Move annotation <span class="tooltip__hotkey">Arrow keys</span></span><br>
    <span>Cycle annotations <span class="tooltip__hotkey">Tab</span></span><br>
    <span>Cycle points <span class="tooltip__hotkey">§ or \`</span></span><br>
    <span>Merge polygons <span class="tooltip__hotkey">Shift + M</span></span><br>
    <span>Subtract polygons <span class="tooltip__hotkey">Shift + S</span></span><br>
    <span>Delete annotation or point <span class="tooltip__hotkey">Backspace</span></span><br>
    <span>Move towards front <span class="tooltip__hotkey">]</span></span><br>
    <span>Move towards back <span class="tooltip__hotkey">[</span></span>
  `,
  icon: 'select',
  keybindings: [
    { keys: ['v'], action: 'edit_tool.activate' },
    { keys: ['shift', 'r'], action: 'edit_tool.restore_joints' }
  ],
  annotationTypes: [],
  sub: false,
  priority: 1,
  disabled: false,
  toolOptions: [
    {
      id: 'restore_joints',
      tooltip: 'Restore keypoints <span class="tooltip__hotkey">Shift + R</span>',
      active: false,
      props: {},
      tabbed: false,
      action: 'edit_tool.restore_joints',
      isVisible: (editor?: Editor): boolean => {
        if (!editor) { return false }
        const { selectedAnnotation } = editor.activeView.annotationManager
        if (!selectedAnnotation) { return false }
        return selectedAnnotation.type === 'skeleton'
      }
    },
    {
      id: 'polygon_merge',
      tooltip: 'Merge Polygon <span class="tooltip__hotkey">Shift + M</span>',
      active: false,
      props: {},
      category: 'polygon-bool',
      tabbed: true,
      action: 'edit_tool.activate_polygon_merge',
      isVisible: (editor?: Editor): boolean => {
        if (!editor) { return false }
        const { selectedAnnotation } = editor.activeView.annotationManager
        if (!selectedAnnotation) { return false }
        return selectedAnnotation.type === 'polygon' && !editor.activeView.isLoading
      }
    },
    {
      id: 'polygon_subtract',
      tooltip: 'Subtract Polygon <span class="tooltip__hotkey">Shift + S</span>',
      active: false,
      props: {},
      category: 'polygon-bool',
      tabbed: true,
      action: 'edit_tool.activate_polygon_subtract',
      isVisible: (editor?: Editor): boolean => {
        if (!editor) { return false }
        const { selectedAnnotation } = editor.activeView.annotationManager
        if (!selectedAnnotation) { return false }
        return selectedAnnotation.type === 'polygon' && !editor.activeView.isLoading
      }
    }
  ]
}

const editConfig: PluginConfig = {
  plugin: editPlugin,
  type: '?',
  name: 'edit',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [
    { keys: ['Backspace'], action: 'edit.delete' },
    { keys: ['Delete'], action: 'edit.delete' },
    { keys: ['shift', 'm'], action: 'edit_tool.activate_polygon_merge' },
    { keys: ['shift', 's'], action: 'edit_tool.activate_polygon_subtract' }
  ],
  tools: [editToolConfig]
}

const boundingBoxToolConfig: ToolConfig = {
  name: 'bounding_box_tool',
  toolTip: `
    <b>Bounding Box Tool <span class="tooltip__hotkey">B</span></b><br>
    <span>Create box <span class="tooltip__hotkey">Click + drag</span></span><br>
    <span>Move box or points <span class="tooltip__hotkey">Arrow keys</span></span><br>
    <span>Cycle annotations <span class="tooltip__hotkey">Tab</span></span><br>
    <span>Cycle points <span class="tooltip__hotkey">§ or \`</span></span><br>
  `,
  icon: 'bbox',
  keybindings: [
    { keys: ['b'], action: 'bounding_box_tool.activate' },
    {
      keys: ['Escape'],
      action: 'bounding_box_tool.cancel',
      when: 'active'
    }
  ],
  annotationTypes: ['bounding_box'],
  sub: false,
  priority: 4,
  disabled: false
}

const boundingBoxConfig: PluginConfig = {
  plugin: boundingBox,
  type: '?',
  name: 'bounding_box',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [boundingBoxToolConfig]
}

const linkToolConfig: ToolConfig = {
  name: 'link_tool',
  toolTip: `
    <b>Link Tool <span class="tooltip__hotkey">X</span></b><br>
    <span>Link two annotations <span class="tooltip__hotkey">Click + drag</span></span><br>
  `,
  icon: 'link',
  keybindings: [
    { keys: ['x'], action: 'link_tool.activate' },
    {
      keys: ['Escape'],
      action: 'link_tool.cancel',
      when: 'active'
    }
  ],
  annotationTypes: ['link'],
  sub: false,
  priority: 5,
  disabled: false
}

const linkConfig: PluginConfig = {
  plugin: link,
  type: '?',
  name: 'link',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [linkToolConfig]
}

const keypointToolConfig: ToolConfig = {
  name: 'keypoint_tool',
  toolTip: `
    <b>Keypoint Tool <span class="tooltip__hotkey">K</span></b><br>
    <span>Add keypoint <span class="tooltip__hotkey">Click</span></span><br>
    <span>Move keypoint <span class="tooltip__hotkey">Arrow keys</span></span><br>
    <span>Cycle annotations <span class="tooltip__hotkey">Tab</span></span>
  `,
  icon: 'keypoint',
  keybindings: [
    { keys: ['k'], action: 'keypoint_tool.activate' },
    {
      keys: ['Escape'],
      action: 'keypoint_tool.cancel',
      when: 'active'
    }
  ],
  annotationTypes: ['keypoint'],
  sub: false,
  priority: 5,
  disabled: false
}

const keypointConfig: PluginConfig = {
  plugin: keypoint,
  type: '?',
  name: 'keypoint',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [keypointToolConfig]
}

const polygonToolConfig: ToolConfig = {
  name: 'polygon_tool',
  toolTip: `
    <b>Polygon Tool <span class="tooltip__hotkey">P</span></b><br>
    <span>Add point <span class="tooltip__hotkey">Click</span></span><br>
    <span>Complete polygon <span class="tooltip__hotkey">Enter</span></span>
  `,
  icon: 'draw',
  keybindings: [
    { keys: ['p'], action: 'polygon_tool.activate' },
    { keys: ['Escape'], action: 'polygon_tool.cancel', when: 'active' },
    { keys: ['Enter'], action: 'polygon_tool.close', when: 'active' }
  ],
  annotationTypes: ['polygon'],
  sub: false,
  priority: 3,
  disabled: false
}

const polygonConfig: PluginConfig = {
  plugin: polygon,
  type: '?',
  name: 'polygon',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [polygonToolConfig]
}

/**
 * Note: render only currently, as initial plan is to use the existing
 * polygon and brush tools and convert these annotations to mask annotations.
 * If mask annotations gets native tools, we need to eventually update this.
 */
const maskConfig: PluginConfig = {
  plugin: mask,
  type: '?',
  name: 'mask',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: []
}

const brushToolConfig: ToolConfig = {
  name: 'brush_tool',
  toolTip: `
    <b>Brush Tool <span class="tooltip__hotkey">F</span></b><br>
    <span>Increase size <span class="tooltip__hotkey">]</span></span><br>
    <span>Decrease size <span class="tooltip__hotkey">[</span></span><br>
    <span>Eraser <span class="tooltip__hotkey">E</span></span><br>
    <span>Quick eraser/brush switch <span class="tooltip__hotkey">Hold Shift</span></span>
  `,
  icon: 'brush',
  keybindings: [
    { keys: ['f'], action: ['brush_tool.activate', 'brush_tool.activate_brush'] },
    { keys: ['e'], action: ['brush_tool.activate', 'brush_tool.activate_eraser'] },
    { keys: ['['], action: 'brush_tool.shrink' },
    { keys: [']'], action: 'brush_tool.grow' },
    { keys: ['Escape'], action: 'brush_tool.cancel', when: 'active' },
    { keys: ['Enter'], action: 'brush_tool.save', when: 'active' }
  ],
  annotationTypes: ['polygon'],
  sub: false,
  priority: 3,
  disabled: false,
  toolOptions: [
    {
      id: 'brush',
      tooltip: 'Brush <span class="tooltip__hotkey">F</span>',
      active: true,
      props: {},
      category: 'brush-mode',
      tabbed: true,
      action: 'brush_tool.activate_brush',
      isVisible: toolOptionAlwaysVisible
    },
    {
      id: 'eraser',
      tooltip: 'Eraser <span class="tooltip__hotkey">E</span>',
      active: false,
      props: {},
      category: 'brush-mode',
      tabbed: true,
      action: 'brush_tool.activate_eraser',
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
      props: { value: 10, commandName: 'brush_tool.set_brush_size' },
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
      action: 'brush_tool.shrink',
      isVisible: toolOptionAlwaysVisible
    },
    {
      id: 'grow',
      tooltip: '',
      active: false,
      props: {},
      category: 'brush-size',
      tabbed: false,
      action: 'brush_tool.grow',
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
      action: 'brush_tool.activate_round_tip',
      isVisible: toolOptionAlwaysVisible
    },
    {
      id: 'squared',
      tooltip: 'Squared Tip',
      active: false,
      props: {},
      category: 'brush-tip-shape',
      tabbed: false,
      action: 'brush_tool.activate_squared_tip',
      isVisible: toolOptionAlwaysVisible
    }
  ]
}

const brushConfig: PluginConfig = {
  plugin: brush,
  type: '?',
  name: 'brush',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [brushToolConfig]
}

const ellipseToolConfig: ToolConfig = {
  name: 'ellipse_tool',
  toolTip: `
    <b>Ellipse Tool <span class="tooltip__hotkey">O</span></b><br>
    <span>Create ellipse <span class="tooltip__hotkey">Click + drag</span></span><br>
    <span>Anchor to centroid <span class="tooltip__hotkey">Alt</span></span><br>
    <span>Symmetrical scale <span class="tooltip__hotkey">Shift</span></span><br>
    <span>Perfect circle scale <span class="tooltip__hotkey">CTRL</span></span><br>
    <span>Move ellipse or points <span class="tooltip__hotkey">Arrow keys</span></span><br>
    <span>Cycle annotations <span class="tooltip__hotkey">Tab</span></span><br>
    <span>Cycle points <span class="tooltip__hotkey">§ or \`</span></span>
  `,
  icon: 'ellipse',
  keybindings: [
    { keys: ['o'], action: 'ellipse_tool.activate' },
    { keys: ['Escape'], action: 'ellipse_tool.cancel', when: 'active' }
  ],
  annotationTypes: ['ellipse'],
  sub: false,
  priority: 4,
  disabled: false
}

const ellipseConfig: PluginConfig = {
  plugin: ellipse,
  type: '?',
  name: 'ellipse',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [ellipseToolConfig]
}

const polylineToolConfig: ToolConfig = {
  name: 'polyline_tool',
  toolTip: `
    <b>Polyline Tool <span class="tooltip__hotkey">L</span></b><br>
    <span>Add point <span class="tooltip__hotkey">Click</span></span><br>
    <span>Complete line <span class="tooltip__hotkey">Double-click or Enter</span></span>
  `,
  icon: 'polyline',
  keybindings: [
    { keys: ['l'], action: 'polyline_tool.activate' },
    { keys: ['Escape'], action: 'polyline_tool.cancel', when: 'active' },
    { keys: ['Enter'], action: 'polyline_tool.confirm', when: 'active' }
  ],
  annotationTypes: ['line'],
  sub: false,
  priority: 4,
  disabled: false
}

const polylineConfig: PluginConfig = {
  plugin: polyline,
  type: '?',
  name: 'line',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [polylineToolConfig]
}

const tagConfig: PluginConfig = {
  plugin: tag,
  type: '?',
  name: 'tag',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: []
}

const clickerToolConfig: ToolConfig = {
  name: 'clicker_tool',
  /* eslint-disable max-len */
  toolTip: `
    <b>Auto-Annotate <span class="tooltip__hotkey">N</span></b><br>
    <span>Create annotation <span class="tooltip__hotkey">Click + drag</span></span><br>
    <span>Include or exclude object <span class="tooltip__hotkey">Click</span></span><br>
    <span>Exit editing mode <span class="tooltip__hotkey">Esc</span> or <span class="tooltip__hotkey">Click outside</span></span><br>
    <span>Enter editing mode <span class="tooltip__hotkey">Shift + N</span></span>
  `,
  /* eslint-enable max-len */
  icon: 'magic',
  keybindings: [
    { keys: ['n'], action: 'clicker_tool.activate' },
    { keys: ['Escape'], action: 'clicker_tool.cancel', when: 'active' },
    { keys: ['Enter'], action: 'clicker_tool.complete', when: 'active' },
    { keys: ['meta', 'Enter'], action: 'clicker_tool.infer', when: 'active' }
  ],
  annotationTypes: ['polygon'],
  sub: false,
  priority: 2,
  disabled: false
}

const autoAnnotateToolConfig: SubToolConfig = {
  name: 'auto_annotate_tool',
  icon: require('@/components/WorkView/assets/auto_annotate_edit.svg'),
  keybindings: [
    { keys: ['m'], action: 'clicker_tool.resume' },
    { keys: ['shift', 'n'], action: 'clicker_tool.resume' }
  ],
  annotationTypes: ['polygon', 'auto_annotate'],
  sub: true,
  disabled: false
}

const clickerConfig: PluginConfig = {
  plugin: clicker,
  type: '?',
  name: 'clicker',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [
    clickerToolConfig,
    autoAnnotateToolConfig
  ]
}

const zoomToolConfig: ToolConfig = {
  name: 'zoom_tool',
  toolTip: `
    <span>Zoom Tool <span class="tooltip__hotkey">Z</span></span><br>
    <span>Zoom in <span class="tooltip__hotkey">+ or Click</span></span><br>
    <span>Zoom out <span class="tooltip__hotkey">- or Shift + Click</span></span><br>
    <span>Zoom in a box <span class="tooltip__hotkey">Click and drag</span></span><br>
    <span>Fit to image <span class="tooltip__hotkey">0</span></span>
  `,
  icon: 'magnifier',
  keybindings: [
    { keys: ['z'], action: 'zoom_tool.activate' },
    { keys: ['Escape'], action: 'zoom_tool.cancel', when: 'active' }
  ],
  annotationTypes: [],
  sub: false,
  priority: 6,
  disabled: false
}

const zoomConfig: PluginConfig = {
  plugin: zoomPlugin,
  type: '?',
  name: 'zoom',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [
    { keys: ['0'], action: 'zoom.reset' },
    { keys: ['+'], action: 'zoom.in' },
    { keys: ['='], action: 'zoom.in' },
    { keys: ['-'], action: 'zoom.out' },
    { keys: ['meta', '='], action: 'zoom.in' },
    { keys: ['meta', '-'], action: 'zoom.out' }
  ],
  tools: [zoomToolConfig]
}

const commentatorToolConfig: ToolConfig = {
  name: 'commentator',
  toolTip: `
    <b>Comment Tool <span class="tooltip__hotkey">C</span></b><br>
    <span>Add comment <span class="tooltip__hotkey">Click + Drag</span></span>
  `,
  icon: 'comment',
  keybindings: [
    { keys: ['c'], action: 'commentator.activate' },
    { keys: ['Escape'], action: 'commentator.cancel', when: 'active' }
  ],
  annotationTypes: [],
  sub: false,
  priority: 5,
  disabled: false
}

const commentatorConfig: PluginConfig = {
  plugin: commentatorPlugin,
  type: '?',
  name: 'commentator',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [commentatorToolConfig]
}

const clipboardConfig: PluginConfig = {
  plugin: clipboardPlugin,
  type: '?',
  name: 'clipboard',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [
    { keys: ['meta', 'c'], action: 'clipboard.copy' },
    { keys: ['meta', 'x'], action: 'clipboard.cut' },
    { keys: ['meta', 'v'], action: 'clipboard.paste' },
    { keys: ['meta', 'shift', 'v'], action: 'clipboard.shift_paste' },
    { keys: ['alt', 'v'], action: 'clipboard.alt_paste' }
  ],
  tools: []
}

const directionalVectorToolConfig: SubToolConfig = {
  name: 'directional_vector_tool',
  icon: require('@/components/WorkView/assets/directional_vector.svg'),
  keybindings: [],
  annotationTypes: ['directional_vector'],
  sub: true,
  disabled: false
}

const directionalVectorConfig: PluginConfig = {
  plugin: directionalVector,
  type: '?',
  name: 'directional_vector',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [directionalVectorToolConfig]
}

const attributesToolConfig: SubToolConfig = {
  name: 'attributes_tool',
  icon: require('@/components/WorkView/assets/attributes.svg'),
  keybindings: [],
  annotationTypes: ['attributes'],
  sub: true,
  disabled: false
}

const attributesConfig: PluginConfig = {
  plugin: attributesPlugin,
  type: '?',
  name: 'attributes',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [attributesToolConfig]
}

const textToolConfig: SubToolConfig = {
  name: 'text_tool',
  icon: require('@/components/WorkView/assets/text.svg'),
  keybindings: [],
  annotationTypes: ['text'],
  sub: true,
  disabled: false
}

const textConfig: PluginConfig = {
  plugin: textPlugin,
  type: '?',
  name: 'text',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [textToolConfig]
}

const instanceIDToolConfig: SubToolConfig = {
  name: 'instance_id_tool',
  icon: require('@/components/WorkView/assets/instance_id.svg'),
  keybindings: [],
  annotationTypes: ['instance_id'],
  sub: true,
  disabled: false
}

const instanceIDConfig: PluginConfig = {
  plugin: instanceIDPlugin,
  type: '?',
  name: 'instance_id',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [instanceIDToolConfig]
}

const saveAnnotationsConfig: PluginConfig = {
  plugin: saveAnnotations,
  type: '?',
  name: 'save_annotations',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [
    { keys: ['ctrl', 's'], action: 'save_annotations.toast' },
    { keys: ['meta', 's'], action: 'save_annotations.toast' }
  ],
  tools: []
}

const boundingBox3dToolConfig: ToolConfig = {
  name: 'bounding_box_3d_tool',
  toolTip: `
    <b>Cuboid Tool <span class="tooltip__hotkey">U</span></b><br>
    <span>Add facet <span class="tooltip__hotkey">Click + Drag</span></span>
  `,
  icon: 'cuboid',
  keybindings: [
    { keys: ['u'], action: 'bounding_box_3d_tool.activate' },
    {
      keys: ['Escape'],
      action: 'bounding_box_3d_tool.cancel',
      when: 'active'
    }
  ],
  annotationTypes: ['cuboid'],
  sub: false,
  priority: 4,
  disabled: false
}

const boundingBox3dConfig: PluginConfig = {
  plugin: boundingBox3d,
  type: '?',
  name: 'bounding_box_3d',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [boundingBox3dToolConfig]
}

const videoPlayerConfig: PluginConfig = {
  plugin: videoPlayerPlugin,
  type: '?',
  name: 'video_player',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [
    { keys: [' '], action: 'video_player.play' }
  ],
  tools: []
}

const windowLevelConfig: PluginConfig = {
  plugin: windowLevelPlugin,
  type: '?',
  name: 'window_level',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [
    { keys: ['tab'], action: 'window_level.activate', eventType: 'keydown' },
    { keys: ['tab'], action: 'window_level.deactivate', eventType: 'keyup' }
  ],
  tools: []
}

const skeletonToolConfig: ToolConfig = {
  name: 'skeleton_tool',
  toolTip: `
    <b>Keypoint Skeleton Tool <span class="tooltip__hotkey">J</span></b><br>
    <span>Draw skeleton <span class="tooltip__hotkey">Click + Drag</span></span><br>
    <span>Move skeleton or points <span class="tooltip__hotkey">Arrow keys</span></span><br>
    <span>Cycle annotations <span class="tooltip__hotkey">Tab</span></span><br>
    <span>Cycle points <span class="tooltip__hotkey">§ or \`</span></span>
  `,
  icon: 'skeleton',
  keybindings: [
    { keys: ['j'], action: 'skeleton_tool.activate' },
    {
      keys: ['Escape'],
      action: 'skeleton_tool.cancel',
      when: 'active'
    }
  ],
  annotationTypes: ['skeleton'],
  sub: false,
  priority: 5,
  disabled: false
}

const skeletonConfig: PluginConfig = {
  plugin: skeleton,
  type: '?',
  name: 'skeleton',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [skeletonToolConfig]
}

const measuresConfig: PluginConfig = {
  plugin: measuresPlugin,
  type: '?',
  name: 'measures',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: []
}

const inferenceConfig: PluginConfig = {
  plugin: inferencePlugin,
  type: '?',
  name: 'inference',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: []
}

const selectToolConfig: ToolConfig = {
  name: 'select_tool',
  toolTip: '<b>Select Tool <span class="tooltip__hotkey">V</span></b><br>',
  icon: 'select',
  keybindings: [{ keys: ['v'], action: 'select_tool.activate' }],
  annotationTypes: [],
  sub: false,
  priority: 1,
  disabled: false
}

const selectConfig: PluginConfig = {
  plugin: selectPlugin,
  type: '?',
  name: 'select',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [selectToolConfig]
}

const FieldToolConfig: ToolConfig = {
  name: 'field_tool',
  toolTip: `
    <b>Field Tool <span class="tooltip__hotkey">F</span></b><br>
    <span>Select key boxes <span class="tooltip__hotkey">Click + drag</span></span><br>
    <span>Select value boxes <span class="tooltip__hotkey">Click + drag</span></span><br>
  `,
  icon: 'field',
  keybindings: [
    { keys: ['f'], action: 'field_tool.activate' },
    {
      keys: ['Escape'],
      action: 'field_tool.cancel',
      when: 'active'
    }
  ],
  annotationTypes: ['graph'],
  sub: false,
  priority: 4,
  disabled: false
}

const stringConfig: PluginConfig = {
  plugin: fieldPlugin,
  type: '?',
  name: 'string',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [{ ...FieldToolConfig, priority: 3 }]
}

const tableToolConfig: ToolConfig = {
  name: 'table_tool',
  toolTip: `
    <b>Table Tool <span class="tooltip__hotkey">T</span></b><br>
    <span>Create box <span class="tooltip__hotkey">Click + drag</span></span><br>
    <span>Move box or points <span class="tooltip__hotkey">Arrow keys</span></span><br>
    <span>Cycle annotations <span class="tooltip__hotkey">Tab</span></span><br>
    <span>Cycle points <span class="tooltip__hotkey">§ or \`</span></span><br>
  `,
  icon: 'table',
  keybindings: [
    { keys: ['t'], action: 'table_tool.activate' },
    {
      keys: ['Escape'],
      action: 'table_tool.cancel',
      when: 'active'
    },
    {
      keys: ['Enter'],
      action: 'table_tool.confirm',
      when: 'active'
    }
  ],
  annotationTypes: ['table'],
  sub: false,
  priority: 4,
  disabled: false,
  toolOptions: [
    {
      id: 'rows',
      tooltip: 'Number of rows of the table',
      active: false,
      props: { value: 2 },
      tabbed: false,
      action: '',
      isVisible: toolOptionAlwaysVisible
    },
    {
      id: 'cols',
      tooltip: 'Number of columns of the table',
      active: false,
      props: { value: 3 },
      tabbed: false,
      action: '',
      isVisible: toolOptionAlwaysVisible
    }
  ]
}

const tableConfig: PluginConfig = {
  plugin: tablePlugin,
  type: '?',
  name: 'table',
  version: '1.0.0',
  active: false,
  context: undefined,
  keybindings: [],
  tools: [{ ...tableToolConfig, priority: 5 }]
}

export class PluginManager {
  private plugins: PluginConfig[] = []
  private readonly editor: Editor
  private readonly sharedBackendPlugins: PluginConfig[]
  private readonly viewPlugins: PluginConfig[]
  private readonly reviewPlugins: PluginConfig[]

  constructor (editor: Editor) {
    this.editor = editor
    this.sharedBackendPlugins = this.initSharedBackendPlugins()
    this.viewPlugins = this.initViewPlugins()
    this.reviewPlugins = this.initReviewPlugins()
  }

  private initSharedBackendPlugins (): PluginConfig[] {
    const sideBarConfig: PluginConfig[] = [
      { ...editConfig, tools: [{ ...editToolConfig, priority: 1 }] },
      { ...clickerConfig, tools: [{ ...clickerToolConfig, priority: 2 }, autoAnnotateToolConfig] },
      { ...polygonConfig, tools: [{ ...polygonToolConfig, priority: 3 }] },
      { ...brushConfig, tools: [{ ...brushToolConfig, priority: 3 }] },
      { ...boundingBoxConfig, tools: [{ ...boundingBoxToolConfig, priority: 4 }] },
      { ...ellipseConfig, tools: [{ ...ellipseToolConfig, priority: 4 }] },
      { ...polylineConfig, tools: [{ ...polylineToolConfig, priority: 4 }] },
      { ...boundingBox3dConfig, tools: [{ ...boundingBox3dToolConfig, priority: 4 }] },
      { ...keypointConfig, tools: [{ ...keypointToolConfig, priority: 5 }] },
      { ...commentatorConfig, tools: [{ ...commentatorToolConfig, priority: 5 }] },
      { ...skeletonConfig, tools: [{ ...skeletonToolConfig, priority: 5 }] },
      { ...zoomConfig, tools: [{ ...zoomToolConfig, priority: 6 }] },
    ]

    if (FeatureFlagsManager.isOnRasters) {
      sideBarConfig.push(
        { ...pixelBrushConfig, tools: [{ ...pixelBrushToolConfig, priority: 7 }] }
      )
    }

    const sharedBackendPlugins: PluginConfig[] = [
      // sidebar
      ...sideBarConfig,

      // render-only mains
      maskConfig,

      // other main
      tagConfig,

      // subs
      attributesConfig,
      directionalVectorConfig,
      instanceIDConfig,
      textConfig,

      // other
      clipboardConfig,
      inferenceConfig,
      magnifierGlassConfig,
      measuresConfig,
      saveAnnotationsConfig,
      v7LookConfig,
      videoPlayerConfig,
      windowLevelConfig,
      zoomCorrectionConfig
    ]

    return sharedBackendPlugins
  }

  private initViewPlugins (): PluginConfig[] {
    const viewPluginsRenderOnlyMains: PluginConfig[] = [
      { ...boundingBox3dConfig, tools: [] },
      { ...boundingBoxConfig, tools: [] },
      { ...brushConfig, tools: [] },
      { ...ellipseConfig, tools: [] },
      { ...keypointConfig, tools: [] },
      { ...linkConfig, tools: [] },
      { ...polygonConfig, tools: [] },
      { ...polylineConfig, tools: [] },
      { ...skeletonConfig, tools: [] },
      { ...stringConfig, tools: [] },
      { ...tableConfig, tools: [] },
      { ...tagConfig, tools: [] },
    ]

    if (FeatureFlagsManager.isOnRasters) {
      viewPluginsRenderOnlyMains.push(
        { ...pixelBrushConfig, tools: [] },
        maskConfig
      )
    }

    const viewPlugins: PluginConfig[] = [
      // sidebar
      { ...selectConfig, tools: [{ ...selectToolConfig, priority: 1 }] },
      { ...zoomConfig, tools: [{ ...zoomToolConfig, priority: 2 }] },

      // setting tools to [] means they do not get rendered in the sidebar
      // render-only mains
      ...viewPluginsRenderOnlyMains,

      // render-only subs
      { ...attributesConfig, tools: [] },
      { ...directionalVectorConfig, tools: [] },
      { ...instanceIDConfig, tools: [] },
      { ...textConfig, tools: [] },

      { ...clickerConfig, tools: [] },
      inferenceConfig,
      magnifierGlassConfig,
      measuresConfig,
      v7LookConfig,
      videoPlayerConfig
    ]

    return viewPlugins
  }

  private initReviewPlugins (): PluginConfig[] {
    const reviewPluginsRenderOnlyMains: PluginConfig[] = [
      { ...boundingBox3dConfig, tools: [] },
      { ...boundingBoxConfig, tools: [] },
      { ...brushConfig, tools: [] },
      { ...ellipseConfig, tools: [] },
      { ...keypointConfig, tools: [] },
      { ...polygonConfig, tools: [] },
      { ...polylineConfig, tools: [] },
      { ...skeletonConfig, tools: [] },
      { ...tagConfig, tools: [] },
    ]

    if (FeatureFlagsManager.isOnRasters) {
      reviewPluginsRenderOnlyMains.push(
        { ...pixelBrushConfig, tools: [] },
        maskConfig
      )
    }

    const reviewPlugins: PluginConfig[] = [
      // sidebar
      { ...selectConfig, tools: [{ ...selectToolConfig, priority: 1 }] },
      { ...commentatorConfig, tools: [{ ...commentatorToolConfig, priority: 2 }] },
      { ...zoomConfig, tools: [{ ...zoomToolConfig, priority: 3 }] },

      // writable subs
      { ...attributesConfig, tools: [{ ...attributesToolConfig, disabled: true }] },
      { ...directionalVectorConfig, tools: [{ ...directionalVectorToolConfig, disabled: true }] },
      { ...instanceIDConfig, tools: [{ ...instanceIDToolConfig, disabled: true }] },
      { ...textConfig, tools: [{ ...textToolConfig, disabled: true }] },

      // render-only mains
      ...reviewPluginsRenderOnlyMains,

      // other
      { ...clickerConfig, tools: [] },
      inferenceConfig,
      magnifierGlassConfig,
      measuresConfig,
      v7LookConfig,
      videoPlayerConfig
    ]

    return reviewPlugins
  }

  get installedPlugins (): PluginConfig[] {
    return this.plugins
  }

  get isWindowLevelPluginActive (): boolean {
    const windowLevelPlugin = this.plugins.find(plugin => plugin.name === 'window_level')
    if (!windowLevelPlugin) { return false }
    const pluginInstance = windowLevelPlugin.plugin as WindowLevelPlugin
    return pluginInstance.active === true
  }

  public pluginsForTutorial (): PluginConfig[] {
    return this.sharedBackendPlugins.filter((pluginConfig) => pluginConfig.name !== 'commentator')
  }

  // Use this function to add plugins that depend on feature flags
  // Currently not used, but will be used in the future again.
  public pluginsForTeam (enabledFeatures: string[]): PluginConfig[] {
    const teamPlugins: PluginConfig[] = []

    if (enabledFeatures.indexOf('LINK_TOOL') >= 0) {
      teamPlugins.push(
        { ...linkConfig, tools: [{ ...linkToolConfig, priority: 5 }] }
      )
    }

    if (enabledFeatures.indexOf('DOCUMENTS') >= 0) {
      teamPlugins.push(stringConfig)
      teamPlugins.push(tableConfig)
    }

    return teamPlugins
  }

  public pluginsForDataset (dataset: DatasetPayload, enabledFeatures: string[]): PluginConfig[] {
    // TODO: Fetch all plugins configured for the current dataset
    const teamPlugins = this.pluginsForTeam(enabledFeatures)
    return this.sharedBackendPlugins.concat(teamPlugins)
  }

  public pluginsForReview (dataset: DatasetPayload, enabledFeatures: string[]): PluginConfig[] {
    const teamPlugins = this.pluginsForTeam(enabledFeatures)
    return dataset.reviewers_can_annotate
      ? this.sharedBackendPlugins.concat(teamPlugins)
      : this.reviewPlugins
  }

  public pluginsForView (): PluginConfig[] {
    return this.viewPlugins
  }

  public install (plugin: PluginConfig): void {
    if (plugin.plugin === undefined) {
      throw new Error(`Plugin is undefined ${plugin.name}`)
    }

    plugin.context = {
      editor: this.editor,
      handles: [],

      registerComponent: (name: string, component: VueConstructor<Vue>): void => {
        Vue.component(name, component)
      },

      registerTool (name: string, tool: Tool): void {
        const toolConfig = plugin.tools.find(entry => entry.name === name)

        if (!toolConfig) { return }

        this.editor.toolManager.registerTool(name, tool, toolConfig)
        // TODO: add this tool into the handles.
      },

      unregisterTool (name: string): void {
        this.editor.toolManager.unregisterTool(name)
      },

      registerCommand (name: string, action: (...args: unknown[]) => void): void {
        this.editor.registerCommand(name, action)
      },

      unregisterCommand (name: string): void {
        this.editor.unregisterCommand(name)
      },

      registerAnnotationRenderer (name: string, renderer: MainAnnotationTypeRenderer): void {
        this.editor.viewsList.forEach(view => {
          view.renderManager.registerAnnotationRenderer(name, renderer)
        })
      },

      unregisterAnnotationRenderer (name: string): void {
        this.editor.viewsList.forEach(view => {
          view.renderManager.unregisterAnnotationRenderer(name)
        })
      },

      registerRasterRenderer (name: string, renderer: RasterTypeRenderer): void {
        this.editor.viewsList.forEach(view => {
          view.renderManager.registerRasterRenderer(name, renderer)
        })
      },

      unregisterRasterRenderer (name: string): void {
        this.editor.viewsList.forEach(view => {
          view.renderManager.unregisterRasterRenderer(name)
        })
      },

      registerSerializer (
        name: string,
        serializer: Serializer
      ): void {
        this.editor.serializerManager.registerSerializer(name, serializer)
      },

      unregisterSerializer (name: string): void {
        this.editor.serializerManager.unregisterSerializer(name)
      },

      registerAnnotationOverlayer (name: string, overlayer: AnnotationOverlayer): void {
        this.editor.viewsList.forEach(view => {
          view.overlayManager.registerAnnotationOverlayer(name, overlayer)
        })
      },

      unregisterAnnotationOverlayer (name: string): void {
        this.editor.viewsList.forEach(view => {
          view.overlayManager.unregisterAnnotationOverlayer(name)
        })
      },

      registerMeasureOverlayer (name: string, overlay: MeasureOverlayer): void {
        this.editor.viewsList.forEach(view => {
          view.measureManager.registerMeasureOverlayer(name, overlay)
        })
      },

      unregisterMeasureOverlayer (name: string): void {
        this.editor.viewsList.forEach(view => {
          view.measureManager.unregisterMeasureOverlayer(name)
        })
      }
    }

    plugin.plugin.activate(plugin.context)

    this.plugins.push(plugin)
  }

  public installAll (plugins: PluginConfig[]): void {
    this.cleanup()
    for (const plugin of plugins) {
      this.install(plugin)
    }
  }

  public handleKeybindings (event: KeyboardEvent, eventType: 'keydown' | 'keyup'): void {
    for (const plugin of this.plugins) {
      for (const keybinding of plugin.keybindings) {
        // If keybinding.eventType was not specified, it would be regarded as `keydown`.
        // If keybinding.eventType was speicifed, only call command when event type is same.
        if (
          (
            (!keybinding.eventType && eventType === 'keydown') ||
            keybinding.eventType === eventType
          ) && keybindingMatch(event, keybinding.keys)
        ) {
          if (typeof keybinding.action === 'string') {
            this.editor.callCommand(keybinding.action)
          } else {
            for (const action of keybinding.action) {
              this.editor.callCommand(action)
            }
          }
          event.preventDefault()
          event.stopPropagation()
        }
      }
    }
  }

  public cleanup (): void {
    this.plugins.forEach(p => p.plugin && p.context && p.plugin.deactivate(p.context))
    this.plugins = []
  }
}
