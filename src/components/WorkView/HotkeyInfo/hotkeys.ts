import { HotkeyCategory } from './types'

const NEXT_ANNOTATION = { description: 'Select next annotation', keys: ['TAB'] }
const PREVIOUS_ANNOTATION = { description: 'Select previous annotation', keys: ['SHIFT', 'TAB'] }
const LAYER_UP = { description: 'Layer up', keys: ['SHIFT', ']'] }
const LAYER_DOWN = { description: 'Layer down', keys: ['SHIFT', '['] }
const LAYER_TOP = { description: 'Layer to top', keys: ['CTRL', ']'] }
const LAYER_BOTTOM = { description: 'Layer to bottom', keys: ['CTRL', '['] }
const NEXT_VERTEX = { description: 'Select next vertex of selected annotation', keys: ['`'] }
const PREVIOUS_VERTEX = {
  description: 'Select previous vertex of selected annotation',
  keys: ['~']
}
const MOVE_ANNOTATION = { description: 'Move selected annotation', keys: ['Arrow keys'] }
const MOVE_ANNOTATION_FASTER = {
  description: 'Move selected annotation faster',
  keys: ['SHIFT', 'Arrow keys']
}
const MOVE_VERTEX = { description: 'Move selected vertex', keys: ['Arrow keys'] }
const MOVE_VERTEX_FASTER = {
  description: 'Move selected vertex faster',
  keys: ['SHIFT', 'Arrow keys']
}
const COPY_ANNOTATION = { description: 'Copy Annotation', keys: ['CMD', 'C'] }
const PAST_ANNOTATION = { description: 'Paste Annotation', keys: ['CMD', 'V'] }
const PASTE_SUB_ANNOTATIONS = { description: 'Paste Sub Annotations', keys: ['CMD', 'SHIFT', 'V'] }
const PASTE_CLASS_NAME_ONLY = { description: 'Paste Class Name Only', keys: ['ALT', 'V'] }
const CUT_ANNOTATION = { description: 'Cut Annotation', keys: ['CMD', 'X'] }
const UNDO = { description: 'Undo', keys: ['CMD', 'Z'] }
const REDO = { description: 'Redo', keys: ['CMD', 'SHIFT', 'Z'] }
const NEXT_TASK_OR_FRAME = { description: 'Next Task or Frame', keys: ['.'] }
const PREVIOUS_TASK_OR_FRAME = { description: 'Previous Task or Frame', keys: [','] }
const NEXT_TASK = { description: 'Next Task', keys: ['>'] }
const PREVIOUS_TASK = { description: 'Previous Task', keys: ['<'] }
const TOGGLE_ANNOTATIONS = { description: 'Toggle Annotations', keys: ['H'] }
const TOGGLE_SUB_ANNOTATIONS = { description: 'Toggle Sub Annotations', keys: ['SHIFT', 'H'] }
const TOGGLE_MEASUREMENTS = { description: 'Toggle Measurements', keys: ['CMD', 'M'] }
const TOGLE_MAGNIFIER = { description: 'Toggle Magnifier', keys: ['CTRL', 'G'] }
const CHANGE_CLASS = { description: 'Change Class', keys: ['Q'] }
const ZOOM_IN = {
  description: 'Zoom In',
  keys: [{ keys: ['+'] }, { keys: ['Scroll'] }],
  multi: true
}
const ZOOM_OUT = {
  description: 'Zoom Out',
  keys: [{ keys: ['-'] }, { keys: ['Scroll'] }],
  multi: true
}
const RESET_ZOOM = { description: 'Reset Zoom', keys: ['0'] }
const DELETE_ANNOTATION = {
  description: 'Delete Annotation',
  keys: [{ keys: ['BACKSPACE'] }, { keys: ['DEL'] }],
  multi: true
}
const PAN_IMAGE = { description: 'Pan Image', keys: ['Click', 'Drag'] }
const PAN_IMAGE_TRACKPAD = { description: 'Pan Image (Trackpad)', keys: ['SHIFT', 'Scroll'] }
const PAN_IMAGE_MOUSE = { description: 'Pan Image (Mouse)', keys: ['Middle Click'] }
const PAN_IMAGE_KEY = { description: 'Pan Image (Key)', keys: ['WASD'] }
const PAN_IMAGE_SHIFT_KEY = { description: 'Pan Image (Key)', keys: ['SHIFT', 'WASD'] }
const WINDOWING = { description: 'Manipulate visual windowing', keys: ['TAB', 'Mouse'] }

const ADVANCE = { description: 'Advance to Next Stage', keys: ['SHIFT', 'ENTER'] }

const APPROVE_IMAGE = { description: 'Approve Image', keys: ['A'] }
const REJECT_IMAGE = { description: 'Reject Image', keys: ['R'] }

const OPEN_ATTRIBUTES_TOOL = { description: 'Open Attributes', keys: ['CMD', 'A'] }

export const ANNOTATION_GENERAL_HOTKEYS: HotkeyCategory = {
  name: 'General',
  hotkeys: [
    NEXT_ANNOTATION,
    PREVIOUS_ANNOTATION,
    LAYER_UP,
    LAYER_DOWN,
    LAYER_TOP,
    LAYER_BOTTOM,
    NEXT_VERTEX,
    PREVIOUS_VERTEX,
    MOVE_ANNOTATION,
    MOVE_ANNOTATION_FASTER,
    MOVE_VERTEX,
    MOVE_VERTEX_FASTER,
    COPY_ANNOTATION,
    PAST_ANNOTATION,
    PASTE_SUB_ANNOTATIONS,
    PASTE_CLASS_NAME_ONLY,
    CUT_ANNOTATION,
    UNDO,
    REDO,
    NEXT_TASK,
    PREVIOUS_TASK,
    NEXT_TASK_OR_FRAME,
    PREVIOUS_TASK_OR_FRAME,
    TOGGLE_ANNOTATIONS,
    TOGGLE_SUB_ANNOTATIONS,
    TOGGLE_MEASUREMENTS,
    OPEN_ATTRIBUTES_TOOL,
    TOGLE_MAGNIFIER,
    ZOOM_IN,
    ZOOM_OUT,
    RESET_ZOOM,
    DELETE_ANNOTATION,
    PAN_IMAGE,
    PAN_IMAGE_TRACKPAD,
    PAN_IMAGE_MOUSE,
    PAN_IMAGE_KEY,
    PAN_IMAGE_SHIFT_KEY,
    WINDOWING
  ]
}

export const WORKFLOW_ANNOTATION_GENERAL_HOTKEYS: HotkeyCategory = {
  name: 'General',
  hotkeys: [
    ...ANNOTATION_GENERAL_HOTKEYS.hotkeys,
    ADVANCE
  ]
}

const PLAY_VIDEO = { description: 'Start/Pause Video', keys: ['Space'] }
const TOGGLE_KEYFRAME = { description: 'Create/Remove Video Keyframe', keys: ['I'] }

export const WORKFLOW_ANNOTATION_VIDEO_HOTKEYS: HotkeyCategory = {
  name: 'Video Annotations',
  hotkeys: [
    PLAY_VIDEO,
    TOGGLE_KEYFRAME
  ]
}

export const REVIEW_GENERAL_HOTKEYS: HotkeyCategory = {
  name: 'General',
  hotkeys: [
    APPROVE_IMAGE,
    REJECT_IMAGE,
    NEXT_TASK,
    PREVIOUS_TASK,
    NEXT_TASK_OR_FRAME,
    PREVIOUS_TASK_OR_FRAME,
    TOGGLE_ANNOTATIONS,
    TOGGLE_SUB_ANNOTATIONS,
    TOGGLE_MEASUREMENTS,
    OPEN_ATTRIBUTES_TOOL,
    TOGLE_MAGNIFIER,
    ZOOM_IN,
    ZOOM_OUT,
    RESET_ZOOM,
    PAN_IMAGE,
    PAN_IMAGE_TRACKPAD,
    PAN_IMAGE_MOUSE,
    PAN_IMAGE_KEY,
    PAN_IMAGE_SHIFT_KEY
  ]
}

export const WORKFLOW_REVIEW_GENERAL_HOTKEYS: HotkeyCategory = {
  name: 'General',
  hotkeys: [...REVIEW_GENERAL_HOTKEYS.hotkeys, ADVANCE]
}

export const OPEN_DATASET_GENERAL_HOTKEYS: HotkeyCategory = {
  name: 'General',
  hotkeys: [
    NEXT_TASK,
    PREVIOUS_TASK,
    NEXT_TASK_OR_FRAME,
    PREVIOUS_TASK_OR_FRAME,
    TOGLE_MAGNIFIER,
    ZOOM_IN,
    ZOOM_OUT,
    RESET_ZOOM,
    PAN_IMAGE,
    PAN_IMAGE_TRACKPAD,
    PAN_IMAGE_MOUSE,
    PAN_IMAGE_KEY,
    PAN_IMAGE_SHIFT_KEY
  ]
}

const SELECT_TOOL = { description: 'Select Tool', keys: ['V'] }
const ZOOM_TOOL = { description: 'Zoom Tool', keys: ['Z'] }
const COMMENT_TOOL = { description: 'Comment Tool', keys: ['C'] }
const POLYGON_TOOL = { description: 'Polygon Tool', keys: ['P'] }
const BOUNDING_BOX_TOOL = { description: 'Bounding Box Tool', keys: ['B'] }
const ELLIPSE_TOOL = { description: 'Ellipse Tool', keys: ['O'] }
const LINE_TOOL = { description: 'Line Tool', keys: ['L'] }
const KEYPOINT_TOOL = { description: 'Keypoint Tool', keys: ['K'] }
const SKELETON_TOOL = { description: 'Skeleton Tool', keys: ['J'] }
const AUTO_ANNOTATE_TOOL = { description: 'Auto-Annotate Tool', keys: ['N'] }
const EDIT_AUTO_ANNOTATE_TOOL = { description: 'Edit Auto-Annotate Tool', keys: ['Shift', 'N'] }

export const ANNOTATION_TOOL_HOTKEYS = {
  name: 'Tool Shortcuts',
  hotkeys: [
    SELECT_TOOL,
    POLYGON_TOOL,
    BOUNDING_BOX_TOOL,
    ELLIPSE_TOOL,
    LINE_TOOL,
    KEYPOINT_TOOL,
    SKELETON_TOOL,
    ZOOM_TOOL,
    AUTO_ANNOTATE_TOOL,
    EDIT_AUTO_ANNOTATE_TOOL,
    COMMENT_TOOL,
    CHANGE_CLASS
  ]
}

export const REVIEW_TOOL_HOTKEYS: HotkeyCategory = {
  name: 'Tool Shortcuts',
  hotkeys: [SELECT_TOOL, ZOOM_TOOL, COMMENT_TOOL, CHANGE_CLASS]
}

export const OPEN_DATASET_TOOL_HOTKEYS = {
  name: 'Tool Shortcuts',
  hotkeys: [SELECT_TOOL, ZOOM_TOOL]
}

export const COMPLETE_TOOL_HOTKEYS: HotkeyCategory = {
  name: 'Tool Shortcuts',
  hotkeys: [SELECT_TOOL, ZOOM_TOOL, COMMENT_TOOL]
}
