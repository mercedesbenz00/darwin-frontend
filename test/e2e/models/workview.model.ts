import { Selector, t, ClientFunction } from 'testcafe'
import ToolBarModel from './workview/toolBar.model'
import TopBarModel from './workview/topBar.model'
import InstructionsSidebarModel from './workview/instructionsSidebar.model'

class ClassModalModel {
  classes = Selector('.class-item')
  saveButton = Selector('.class-selection button.button--dark:not(.button--secondary)')
}

class LayerBarModel {
  classes = Selector('.layerbar .layerbar-item')
}

class CommentReplyBoxModel {
  profile = Selector('.reply-box__profile')
  textarea = Selector('.reply-box textarea')
  actions = Selector('.reply-box .reply-box__actions')
  postBtn = Selector('.reply-box button:not(.button--secondary)')
  cancelBtn = Selector('.reply-box button.button--secondary')
}

class CommentItemModel {
  profileName = (index: number) => Selector('.comment-item .comment-profile__name').nth(index)
  profileAgo = (index: number) => Selector('.comment-item .comment-item__datetime').nth(index)
  profileMoreButton = (index: number) => Selector('.comment-item .comment-item__more').nth(index)
  commentBody = (index: number) => Selector('.comment-item .comment-item__non-edit').nth(index)
  editTextarea = Selector('.comment-item textarea')
  editSaveButton = Selector('.comment-item button:not(.button--secondary)')
  overlayEditComment = Selector('.tooltip.popover .comment-item__overlay__item').withText('Edit Comment')
  overlayDeleteComment = Selector('.tooltip.popover .comment-item__overlay__item').withText('Delete Comment')
  overlayDeleteThread = Selector('.tooltip.popover .comment-item__overlay__item').withText('Delete Thread')
}

class CommentThreadModel {
  replyBox = new CommentReplyBoxModel()
  commentItem = new CommentItemModel()
  comments = Selector('.comment-item')
  container = Selector('.comment-thread')
}

class TagApplierModel {
  input = Selector('.tag-applier .tag-applier__input input')
  appliedTags = Selector('.tag-applier .ti-tag')
  appliedTagRemoveButtons = Selector('.tag-applier .ti-icon-close')
  availableTags = Selector('.tag-applier .tag-applier__tag')
  createButton = Selector('.tag-applier .tag-applier__create')
}

export default class WorkviewModel {
  canvas = Selector('#main-canvas')
  toolBar = new ToolBarModel()
  topBar = new TopBarModel()

  bottomBarImages = Selector('.workview-image')
  bottomBarSelectedImage = Selector('.workview-image--selected')

  layerBar = new LayerBarModel()
  classModal = new ClassModalModel()
  instructionsSidebar = new InstructionsSidebarModel()
  commentThread = new CommentThreadModel()
  commentIcon = Selector('.comment-icons div')
  tagApplier = new TagApplierModel()

  drawBox (x: number, y: number, w: number, h: number) {
    return t.drag(this.canvas, w, h, { offsetX: x, offsetY: y })
  }

  async drawPolygon (...points: [number, number][]) {
    for (const [x, y] of points) {
      await t.click(this.canvas, { offsetX: x, offsetY: y })
    }
  }

  /**
   * The system decides when to show dataset instructions based an a local storage flag
   *
   * This action sets the flad to indicate the user has already viewed the instructions.
   */
  setViewedInstructions = ClientFunction<void, [number]>(
    // viewedInstructionsOnDataset changes need to be reflected here
    (id) => window.localStorage.setItem((`viewed_instructions_on_dataset:${id}`), 'true')
  )

  /**
   * The system decides when to show dataset instructions based an a local storage flag
   *
   * This action sets the flad to indicate the user has NOT yet viewed the instructions.
   */
  setNotViewedInstructions = ClientFunction<void, [number]>(
    // viewedInstructionsOnDataset changes need to be reflected here
    (id) => window.localStorage.removeItem((`viewed_instructions_on_dataset:${id}`))
  )
}
