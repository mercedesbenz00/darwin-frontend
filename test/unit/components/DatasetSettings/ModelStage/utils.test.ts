import { buildTrainingClass } from 'test/unit/factories'
import { bottle, flask } from 'test/unit/fixtures/annotation-class-payloads'

import { areTypesCompatible, automapClasses, premapClasses } from '@/components/DatasetSettings/ModelStage/utils'
import { ModelStageTemplatePayload } from '@/store/types'

const modelFlask = buildTrainingClass({
  id: 'model-1',
  name: 'ModelFlask',
  display_name: 'Model Flask',
  type: 'bounding_box'
})

const modelBottle = buildTrainingClass({
  id: 'model-2',
  name: 'ModelBottle',
  display_name: 'Model Bottle',
  type: 'bounding_box'
})

describe('automap classes', () => {
  it('maps by id', () => {
    const matched = { ...modelFlask, darwin_id: flask.id }
    expect(automapClasses([matched], [flask])).toEqual([{
      annotationClass: flask,
      modelClass: matched
    }])
  })

  it('maps by name', () => {
    const matched = { ...modelFlask, name: flask.name }
    expect(automapClasses([matched], [flask])).toEqual([{
      annotationClass: flask,
      modelClass: matched
    }])
  })

  it('maps by display_name', () => {
    const matched = { ...modelFlask, display_name: flask.name }
    expect(automapClasses([matched], [flask])).toEqual([{
      annotationClass: flask,
      modelClass: matched
    }])
  })

  it('returns unmapped', () => {
    expect(automapClasses([modelFlask], [flask])).toEqual([{
      annotationClass: null,
      modelClass: modelFlask
    }])
  })

  it('maps multiple', () => {
    const matchedFlask = { ...modelFlask, display_name: flask.name }
    const matchedBottle = { ...modelBottle, display_name: bottle.name }

    expect(automapClasses([matchedFlask, matchedBottle], [flask, bottle])).toEqual([
      { annotationClass: flask, modelClass: matchedFlask },
      { annotationClass: bottle, modelClass: matchedBottle }
    ])
  })
})

describe('premapClasses', () => {
  let mapping: Exclude<ModelStageTemplatePayload['metadata']['class_mapping'], undefined>

  it('maps according to specified initial mapping', () => {
    mapping = [
      { annotation_class_id: flask.id, model_class_label: modelFlask.name },
      { annotation_class_id: bottle.id, model_class_label: modelBottle.name }
    ]

    expect(premapClasses([modelFlask, modelBottle], [flask, bottle], mapping)).toEqual([
      { annotationClass: flask, modelClass: modelFlask },
      { annotationClass: bottle, modelClass: modelBottle }
    ])
  })

  it('can map one model class to multiple annotation classes', () => {
    mapping = [
      { annotation_class_id: flask.id, model_class_label: modelFlask.name },
      { annotation_class_id: flask.id, model_class_label: modelBottle.name }
    ]
    expect(premapClasses([modelFlask, modelBottle], [flask, bottle], mapping)).toEqual([
      { annotationClass: flask, modelClass: modelFlask },
      { annotationClass: flask, modelClass: modelBottle }
    ])
  })

  it('makes no attempts to map automatically', () => {
    expect(premapClasses([modelFlask, modelBottle], [flask, bottle], [])).toEqual([
      { annotationClass: null, modelClass: modelFlask },
      { annotationClass: null, modelClass: modelBottle }
    ])
  })
})

describe('areTypesCompatible', () => {
  it('works as expected', () => {
    expect(areTypesCompatible('polygon', 'polygon')).toBe(true)
    expect(areTypesCompatible('bounding_box', 'bounding_box')).toBe(true)
    expect(areTypesCompatible('polygon', 'bounding_box')).toBe(true)
    expect(areTypesCompatible('bounding_box', 'polygon')).toBe(true)

    expect(areTypesCompatible('ellipse', 'ellipse')).toBe(true)
    expect(areTypesCompatible('cuboid', 'cuboid')).toBe(true)
    expect(areTypesCompatible('keypoint', 'keypoint')).toBe(true)
    expect(areTypesCompatible('skeleton', 'skeleton')).toBe(true)
    expect(areTypesCompatible('text', 'text')).toBe(true)
    expect(areTypesCompatible('tag', 'tag')).toBe(true)

    expect(areTypesCompatible('ellipse', 'cuboid')).toBe(false)
    expect(areTypesCompatible('polygon', 'cuboid')).toBe(false)
    expect(areTypesCompatible('bounding_box', 'cuboid')).toBe(false)
  })
})
