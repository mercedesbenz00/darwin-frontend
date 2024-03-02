import { Selector } from 'testcafe'

export default class ToolBarModel {
  selection = Selector('#toolbar_edit_tool')
  polygon = Selector('#toolbar_polygon_tool')
  boundingBox = Selector('#toolbar_bounding_box_tool')
  comment = Selector('#toolbar_commentator')
  zoom = Selector('#toolbar_zoom_tool')
  scale = Selector('.workview__toolbar__zoom-info')
}
