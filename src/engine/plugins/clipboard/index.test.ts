import { createLocalVue } from '@vue/test-utils'
import * as uuid from 'uuid'
import Vuex from 'vuex'

import { buildFlaskStageVideoAnnotation } from 'test/unit/components/WorkView/VideoScrubber/utils'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetItemPayload, buildDatasetVideoPayload } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager, PluginConfig, sharedBackendPlugins } from '@/engine/managers'
import { serializer } from '@/engine/plugins/polygon/serializer'
import { POLYGON_ANNOTATION_TYPE } from '@/engine/plugins/polygon/types'

jest.mock('uuid')

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let editor: Editor
let store: ReturnType<typeof createTestStore>
let clipboardConfig: PluginConfig

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)

  clipboardConfig = sharedBackendPlugins.find(plugin => plugin.name === 'clipboard') as PluginConfig

  editor.pluginManager.install(clipboardConfig!)

  const annotation = buildFlaskStageVideoAnnotation(editor, {
    isSelected: true,
    classId: 1,
    data: {
      frames: {
        0: {
          keyframe: true,
          polygon: { path: [{ x: 0, y: 0 }, { x: 10, y: 10 }] }
        },
        3: {
          keyframe: true,
          polygon: { path: [{ x: 0, y: 0 }, { x: 20, y: 20 }] }
        }
      },
      sub_frames: {
        1: {
          keyframe: true,
          text: { text: 'Text1' }
        },
        5: {
          keyframe: true,
          text: { text: 'Text2' }
        }
      },
      interpolated: false,
      segments: [[0, 30]]
    }
  })

  jest.spyOn(editor.activeView, 'currentItem', 'get')
    .mockReturnValue(buildDatasetItemPayload({
      dataset_video: buildDatasetVideoPayload({
        width: 100,
        height: 200,
        metadata: { type: 'video' }
      })
    }))
  jest.spyOn(editor.activeView.annotationManager, 'annotations', 'get')
    .mockReturnValue([annotation])

  editor.serializerManager.registerSerializer(POLYGON_ANNOTATION_TYPE, serializer)
  clipboardConfig.plugin?.activate(clipboardConfig.context!)

  const fakeUUID = 'mocked uuid'
  jest.spyOn(uuid, 'v4').mockReturnValue(fakeUUID)
})

it('should copy selected annotation', () => {
  const plugin: any = clipboardConfig.plugin

  expect(plugin.clipboard).toBe(undefined)

  editor.pluginManager.handleKeybindings({
    key: 'c',
    ctrlKey: true,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn()
  } as any, 'keydown')

  expect(plugin.clipboard).toEqual(expect.objectContaining({ id: 'mocked uuid' }))
})

it('should paste copied annotation with all keyframes', () => {
  jest.spyOn(editor.activeView.annotationManager, 'persistCreateAnnotation')

  editor.pluginManager.handleKeybindings({
    key: 'c',
    ctrlKey: true,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn()
  } as any, 'keydown')

  editor.pluginManager.handleKeybindings({
    key: 'v',
    ctrlKey: true,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn()
  } as any, 'keydown')

  expect(editor.activeView.annotationManager.persistCreateAnnotation).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        frames: {
          0: editor.activeView.annotationManager.annotations[0].data.frames[0],
          3: editor.activeView.annotationManager.annotations[0].data.frames[3]
        }
      })
    })
  )
})
