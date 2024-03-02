import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildModelTemplatePayload,
  buildRunningSessionPayload,
  buildTrainedModelPayload
} from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers/itemManager'
import { Click } from '@/engineCommon/backend'
import { Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { ModelType } from '@/store/types'

import { ClickImagePayload } from './getImagePayload'

import { buildAutoAnnotateRequestPayload } from '.'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

let clickImagePayload: ClickImagePayload
let bbox: Rectangle<'Image'>

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  clickImagePayload = {
    imagePayload: { url: 'http://fake-url/' },
    mapping: {
      forward: (point) => point,
      backward: (point) => point
    }
  }
  bbox = new Rectangle(new Point({ x: 0, y: 0 }), new Point({ x: 10, y: 10 }))
})

describe('buildAutoAnnotateRequestPayload on Auto-Annotate', () => {
  let clicks: Click[]

  beforeEach(() => {
    clicks = [{ x: 1, y: 1, type: 'add' }]

    const trainedModel = buildTrainedModelPayload({
      model_template: buildModelTemplatePayload({
        type: ModelType.AutoAnnotation
      })
    })
    store.state.neuralModel.trainedModels = [trainedModel]

    const autoAnnotateModel = buildRunningSessionPayload({
      trained_model_id: trainedModel.id
    })
    store.state.workview.autoAnnotateModels = [autoAnnotateModel]
    store.state.workview.preselectedModelId = autoAnnotateModel.id
  })

  it('wraps extra data around a "data" field', () => {
    expect(buildAutoAnnotateRequestPayload(
      editor,
      clickImagePayload,
      bbox,
      clicks
    )).toEqual({
      data: {
        bbox: { x1: 0, x2: 10, y1: 0, y2: 10 },
        clicks: [{ type: 'add', x: 1, y: 1 }],
        threshold: undefined
      },
      image: {
        url: 'http://fake-url/'
      }
    })
  })

  it('includes "treshold"', () => {
    expect(buildAutoAnnotateRequestPayload(
      editor,
      clickImagePayload,
      bbox,
      clicks,
      0.8
    )).toEqual({
      data: {
        bbox: { x1: 0, x2: 10, y1: 0, y2: 10 },
        clicks: [{ type: 'add', x: 1, y: 1 }],
        threshold: 0.8
      },
      image: {
        url: 'http://fake-url/'
      }
    })
  })
})

describe('buildAutoAnnotateRequestPayload on any other model', () => {
  it('flattens image and extra data', () => {
    expect(buildAutoAnnotateRequestPayload(
      editor,
      clickImagePayload,
      bbox,
      []
    )).toEqual({
      bbox: { x1: 0, x2: 10, y1: 0, y2: 10 },
      threshold: undefined,
      image: {
        url: 'http://fake-url/'
      }
    })
  })

  it('includes "treshold"', () => {
    expect(buildAutoAnnotateRequestPayload(
      editor,
      clickImagePayload,
      bbox,
      [],
      0.8
    )).toEqual({
      bbox: { x1: 0, x2: 10, y1: 0, y2: 10 },
      threshold: 0.8,
      image: {
        url: 'http://fake-url/'
      }
    })
  })
})
