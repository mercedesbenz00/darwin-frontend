/**
 * Cursors in Workview
 * Class names for every key should be defined in `src/components/WorkView/workview-cursor.scss
 */
export enum EditorCursor {
  Default = 'default-cur',
  Pointer = 'pointer-cur',
  Draw = 'draw-cur',
  AddPoint = 'add-point-cur',
  RemovePoint = 'remove-point-cur',
  Edit = 'edit-cur',
  Ellipse = 'ellipse-cur',
  DefaultMove = 'default-move-cur',
  Move = 'move-cur',
  Moving = 'moving-cur',
  Magic = 'magic-cur',
  MagicAddPoint = 'magic-add-point-cur',
  MagicRemovePoint = 'magic-remove-point-cur',
  MagicDeleteClick = 'magic-delete-click-cur',
  BBox = 'bbox-cur',
  Commentator = 'commentator-cur',
  ZoomIn = 'zoom-in-cur',
  ZoomOut = 'zoom-out-cur',
  Hidden = 'hidden-cur',
  NWResize = 'nw-resize-cur',
  NEResize = 'ne-resize-cur',
  SEResize = 'se-resize-cur',
  SWResize = 'sw-resize-cur'
}
