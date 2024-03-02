import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildCommentThread } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { CommentThread, View } from '@/engine/models'
import { Point } from '@/engineCommon/point'

import CommentThreadIcon from './CommentThreadIcon.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: {
  commentThread: CommentThread
  view: View
}

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)

  jest.spyOn(editor.camera, 'imageViewToCanvasView')
    .mockImplementation(point => new Point<'Canvas'>(point))
  propsData = {
    commentThread: buildCommentThread(),
    view: editor.viewsList[0]
  }
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(CommentThreadIcon, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

describe('when highlighted', () => {
  beforeEach(() => {
    propsData.commentThread.isHighlighted = true
  })

  itMatchesSnapshot()
})

describe('when selected', () => {
  beforeEach(() => {
    propsData.commentThread.isSelected = true
  })

  itMatchesSnapshot()
})

describe('with commentCount', () => {
  beforeEach(() => {
    propsData.commentThread.commentCount = 3
  })

  itMatchesSnapshot()
})

describe('when commentator tool is active', () => {
  beforeEach(() => {
    store.commit('workview/SET_CURRENT_TOOL', 'commentator')
  })

  itMatchesSnapshot()
})
