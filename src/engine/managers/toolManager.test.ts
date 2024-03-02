import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotation,
  buildAnnotationClassPayload,
  buildAnnotationTypePayload,
  buildDatasetPayload,
  buildToolConfigEntry
} from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager, ToolManager, Tool } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { AnnotationTypeName } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let toolManager: ToolManager
let annotation: Annotation

const initEditor = (store: ReturnType<typeof createTestStore>): Editor => {
  const editor = new Editor(new ItemManager(store), store)
  jest.spyOn(editor.camera, 'scaleToFit').mockReturnValue(undefined)
  const sfh = buildDatasetPayload({ id: 1 })
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))

  toolManager = new ToolManager(editor)
  return editor
}

beforeEach(() => {
  const sfh = buildDatasetPayload({ id: 7 })
  const box = buildAnnotationClassPayload({
    id: 1,
    name: 'box',
    datasets: [{ id: sfh.id }],
    annotation_types: ['bounding_box']
  })
  const boundingBox = buildAnnotationTypePayload({
    name: 'bounding_box',
    granularity: 'main'
  })
  store = createTestStore()
  store.commit('workview/SET_DATASET', sfh)
  store.commit('aclass/SET_CLASSES', [box])
  store.commit('aclass/SET_TYPES', [boundingBox])
  editor = initEditor(store)
  annotation = buildAnnotation(editor, { classId: 1 })!
  editor.activeView.setAnnotationClasses(store.state.aclass.classes)
  jest.spyOn(editor.activeView.annotationManager, 'annotations', 'get').mockReturnValue([
    annotation
  ])
})

test('Registered tool by name works', () => {
  const tool: Tool = {
    activate () { },
    deactivate () { },
    reset () { }
  }

  jest.spyOn(toolManager, 'unregisterTool')

  expect(toolManager.availableTools).toHaveLength(0)

  toolManager.registerTool('my_tool', tool, buildToolConfigEntry('my_tool'))
  expect(toolManager.availableTools).toHaveLength(1)

  toolManager.registerTool('my_tool2', tool, buildToolConfigEntry('my_tool2'))
  expect(toolManager.availableTools).toHaveLength(2)

  toolManager.registerTool('my_tool2', tool, buildToolConfigEntry('my_tool2'))
  expect(toolManager.unregisterTool).toHaveBeenCalledWith('my_tool2')
  expect(toolManager.availableTools).toHaveLength(2)
})

test('activateTool calls active/deactive', () => {
  const activateFn = jest.fn()
  const deactivateFn = jest.fn()
  const resetFn = jest.fn()
  const tool1: Tool = {
    activate: activateFn,
    deactivate: deactivateFn,
    reset: resetFn
  }
  const tool2: Tool = {
    activate () { },
    deactivate () { },
    reset () { }
  }
  const annotationTypes: AnnotationTypeName[] = ['bounding_box']
  toolManager.registerTool('my_tool', tool1, buildToolConfigEntry('my_tool', annotationTypes))

  expect(activateFn).toBeCalledTimes(0)

  const annotationTypes2: AnnotationTypeName[] = ['polygon']
  toolManager.registerTool('my_tool2', tool2, buildToolConfigEntry('my_tool2', annotationTypes2))

  expect(activateFn).toBeCalledTimes(0)
  expect(deactivateFn).toBeCalledTimes(0)
  expect(toolManager.currentTool).toBeNull()
  expect(toolManager.currentAnnotationTypes()).toEqual([])

  toolManager.activateTool('my_tool')
  expect(activateFn).toBeCalledTimes(1)
  expect(toolManager.currentTool!.name).toBe('my_tool')
  expect(toolManager.currentAnnotationTypes()).toEqual(annotationTypes)

  toolManager.activateTool('my_tool2')
  expect(activateFn).toBeCalledTimes(1)
  expect(deactivateFn).toBeCalledTimes(1)
  expect(toolManager.currentTool!.name).toBe('my_tool2')
  expect(toolManager.currentAnnotationTypes()).toEqual(annotationTypes2)

  toolManager.activateTool('my_tool')
  expect(activateFn).toBeCalledTimes(2)
  expect(deactivateFn).toBeCalledTimes(1)
})

test('unregisterTool removes tool', () => {
  const tool1: Tool = {
    activate () { },
    deactivate () { },
    reset () { }
  }

  toolManager.registerTool('my_tool', tool1, buildToolConfigEntry('my_tool'))
  expect(toolManager.availableTools).toHaveLength(1)
  toolManager.unregisterTool('my_tool')
  expect(toolManager.availableTools).toHaveLength(0)
  toolManager.registerTool('my_tool', tool1, buildToolConfigEntry('my_tool'))
  expect(toolManager.availableTools).toHaveLength(1)
})

test('unregisterTool calls deactive', () => {
  const activateFn = jest.fn()
  const deactivateFn = jest.fn()
  const resetFn = jest.fn()

  const tool1: Tool = {
    activate: activateFn,
    deactivate: deactivateFn,
    reset: resetFn
  }

  toolManager.registerTool('my_tool', tool1, buildToolConfigEntry('my_tool'))
  toolManager.activateTool('my_tool')
  expect(activateFn).toHaveBeenCalledTimes(1)
  expect(deactivateFn).toHaveBeenCalledTimes(0)

  toolManager.unregisterTool('my_tool')
  expect(activateFn).toHaveBeenCalledTimes(1)
  expect(deactivateFn).toHaveBeenCalledTimes(1)
  expect(toolManager.availableTools).toHaveLength(0)
})

test('deactivating a plugin, remove handles', () => {
  const releaseFn = jest.fn()

  const tool1: Tool = {
    activate: (context) => { context.handles.push({ id: 1, release: releaseFn }) },
    deactivate: () => { expect(releaseFn).toBeCalledTimes(0) },
    reset: () => { }
  }
  toolManager.registerTool('my_tool', tool1, buildToolConfigEntry('my_tool'))
  toolManager.activateTool('my_tool')
})

describe('currentAnnotationTypes', () => {
  test('returns the list of name of annotation type supported by current tool', () => {
    const tool1: Tool = {
      activate () { },
      deactivate () { },
      reset () { }
    }

    toolManager.registerTool('my_tool', tool1, buildToolConfigEntry('my_tool', ['polygon']))
    toolManager.activateTool('my_tool')

    expect(toolManager.currentAnnotationTypes()).toEqual(['polygon'])
  })

  test('returns the list of name of annotation type for the current selected annotation', () => {
    const tool1: Tool = {
      activate () { },
      deactivate () { },
      reset () { }
    }
    const editTool: Tool = {
      activate () { },
      deactivate () { },
      reset () { }
    }

    toolManager.registerTool('my_tool', tool1, buildToolConfigEntry('my_tool', ['polygon']))
    toolManager.registerTool('edit_tool', editTool, buildToolConfigEntry('edit_tool', []))
    toolManager.activateTool('edit_tool')

    annotation.select(false)

    expect(toolManager.currentAnnotationTypes()).toEqual(['bounding_box'])
  })
})

describe('findByName', () => {
  beforeEach(() => {
    const tool: Tool = {
      activate () { },
      deactivate () { },
      reset () { }
    }

    toolManager.registerTool('bounding_box_3d_tool', tool, buildToolConfigEntry('bounding_box_3d_tool'))
    toolManager.registerTool('polygon_tool', tool, buildToolConfigEntry('polygon_tool'))
    toolManager.registerTool('polyline_tool', tool, buildToolConfigEntry('polyline_tool'))
  })

  test('returns tool by name', () => {
    expect(toolManager.findByName('polygon_tool'))
      .toEqual(expect.objectContaining({
        name: 'polygon_tool'
      }))
  })
})

describe('findByMainAnnotationTypeName', () => {
  beforeEach(() => {
    const tool: Tool = {
      activate () { },
      deactivate () { },
      reset () { }
    }

    toolManager.registerTool('bounding_box_3d_tool', tool, buildToolConfigEntry('bounding_box_3d_tool'))
    toolManager.registerTool('polygon_tool', tool, buildToolConfigEntry('polygon_tool'))
    toolManager.registerTool('polyline_tool', tool, buildToolConfigEntry('polyline_tool'))
  })

  test('returns tool by main annotation type name', () => {
    expect(toolManager.findByMainAnnotationTypeName('polygon'))
      .toEqual(expect.objectContaining({
        name: 'polygon_tool'
      }))
  })

  test('returns polyline_tool when main annotation type name is "line"', () => {
    expect(toolManager.findByMainAnnotationTypeName('line'))
      .toEqual(expect.objectContaining({
        name: 'polyline_tool'
      }))
  })

  test('returns bounding_box_3d_tool when main annotation type name is "cuboid"', () => {
    expect(toolManager.findByMainAnnotationTypeName('cuboid'))
      .toEqual(expect.objectContaining({
        name: 'bounding_box_3d_tool'
      }))
  })
})
