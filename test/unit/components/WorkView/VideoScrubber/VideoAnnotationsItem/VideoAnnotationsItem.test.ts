import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import {
  buildFlaskStageVideoAnnotation,
  buildTagStageVideoAnnotation
} from 'test/unit/components/WorkView/VideoScrubber/utils'
import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildLoadedFrame, buildLoadedVideo, buildWorkflowStagePayload } from 'test/unit/factories'
import { flask } from 'test/unit/fixtures/annotation-class-payloads'
import { emitRootStub } from 'test/unit/testHelpers'

import VideoAnnotationsItem from '@/components/WorkView/VideoScrubber/VideoAnnotationsItem/VideoAnnotationsItem.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { WorkflowStagePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

const changeWidth = jest.fn()
const checkParentSize = jest.fn()
const moveHorizontally = jest.fn()

const mocks = {
  $theme: createMockTheme()
}
const stubs: Stubs = {
  VueDraggableResizable: {
    template: `
      <div class="vue-draggable-resizable-stub">
        <slot name="ml" />
        <slot name="mr" />
        <slot />
      </div>
    `,
    methods: {
      changeWidth,
      checkParentSize,
      moveHorizontally
    }
  }
}
let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: {
  annotation: Annotation
  editor: Editor
  yIndex: number
}

let stage: WorkflowStagePayload

beforeEach(() => {
  store = createTestStore()

  store.commit('aclass/SET_CLASSES', [flask])
  stage = buildWorkflowStagePayload({ id: 1 })
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('ui/SET_WORKVIEW_VIDEO_FRAME_LINE_WIDTH', 4)

  editor = new Editor(new ItemManager(store), store)
  const flaskAnnotation = buildFlaskStageVideoAnnotation(
    editor,
    { workflowStageId: stage.id, zIndex: 1 }
  )
  const tagAnnotation = buildTagStageVideoAnnotation(
    editor,
    { workflowStageId: stage.id, zIndex: 2 }
  )
  editor.activeView.annotationManager.annotationsMap = {
    [flaskAnnotation.id]: flaskAnnotation,
    [tagAnnotation.id]: tagAnnotation
  }
  propsData = {
    annotation: editor.activeView.annotationManager.annotationsMap[flaskAnnotation.id],
    editor,
    yIndex: 1
  }

  changeWidth.mockClear()
  checkParentSize.mockClear()
  moveHorizontally.mockClear()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(VideoAnnotationsItem, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('sets x and w on child', async () => {
  const wrapper = shallowMount(VideoAnnotationsItem, { localVue, mocks, propsData, store, stubs })
  await wrapper.vm.$nextTick()
  expect(checkParentSize).toHaveBeenCalled()
  expect(changeWidth).toHaveBeenCalledWith(120)
  expect(moveHorizontally).toHaveBeenCalledWith(0)
})

const model = {
  leftHandle: '.video-annotations-item__ml',
  rightHandle: '.video-annotations-item__mr',
  draggableResizable: '.vue-draggable-resizable-stub'
}

it('correctly renders tooltips when not dragging', async () => {
  const wrapper = shallowMount(VideoAnnotationsItem, { localVue, mocks, propsData, store, stubs })
  await wrapper.vm.$nextTick()

  expect(wrapper.find(model.leftHandle).attributes('tooltip'))
    .toContain("'content':'Frame 0'")
  expect(wrapper.find(model.rightHandle).attributes('tooltip'))
    .toContain("'content':'Frame 30'")
})

it('correctly renders tooltips when dragging', async () => {
  const wrapper = shallowMount(VideoAnnotationsItem, { localVue, mocks, propsData, store, stubs })
  await wrapper.vm.$nextTick()
  await emitRootStub(wrapper, 'resizing', 16, 0, 20)

  expect(wrapper.find(model.leftHandle).attributes('tooltip'))
    .toContain("'content':'Frame 4'")
  expect(wrapper.find(model.rightHandle).attributes('tooltip'))
    .toContain("'content':'Frame 9'")
})

it('renders tooltip when hover', async () => {
  const wrapper = shallowMount(VideoAnnotationsItem, { localVue, mocks, propsData, store, stubs })
  await wrapper.vm.$nextTick()
  await wrapper.find(model.leftHandle).trigger('mouseover')
  expect(wrapper.find(model.leftHandle).attributes('tooltip'))
    .toContain("'show':true")

  await wrapper.find(model.rightHandle).trigger('mouseover')
  expect(wrapper.find(model.rightHandle).attributes('tooltip'))
    .toContain("'show':true")
})

it('selects an annotation on click', async () => {
  const wrapper = shallowMount(VideoAnnotationsItem, { localVue, mocks, propsData, store, stubs })
  const flaskAnnotation = editor.activeView.annotationManager.annotationsMap[
    Object.keys(editor.activeView.annotationManager.annotationsMap)[0]
  ]
  jest.spyOn(flaskAnnotation, 'select').mockReturnValue(undefined)
  await wrapper.find('video-annotations-item-annotation-stub').vm.$emit('click')
  expect(flaskAnnotation.select).toBeCalled()
})

it('segment end index equal to "null" should be expected as the last frame index', () => {
  editor.activeView.annotationManager.annotationsMap = {
    1: buildTagStageVideoAnnotation(editor, {
      id: '1',
      workflowStageId: stage.id,
      zIndex: 2,
      data: {
        frames: {
          0: { keyframe: true, tag: {} }
        },
        interpolated: false,
        segments: [[0, null]]
      }
    })
  }

  editor.loadedVideo = buildLoadedVideo({
    frames: {
      0: buildLoadedFrame({ seq: 1 }),
      1: buildLoadedFrame({ seq: 2 }),
      2: buildLoadedFrame({ seq: 3 }),
      3: buildLoadedFrame({ seq: 4 }),
      4: buildLoadedFrame({ seq: 5 })
    }
  })

  propsData = {
    annotation: editor.activeView.annotationManager.annotationsMap[1],
    editor,
    yIndex: 1
  }

  const wrapper = shallowMount(VideoAnnotationsItem, { localVue, mocks, propsData, store, stubs })
  expect((wrapper.vm as any).endIndex).toBe(5)
})
