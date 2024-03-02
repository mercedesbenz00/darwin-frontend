import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotation } from 'test/unit/factories'

import { mergeSubAnnotations } from '@/engine/actions/utils/mergeSubAnnotations'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Text } from '@/engine/plugins/text/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

describe('mergeSubAnnotations', () => {
  beforeEach(() => {
    store = createTestStore()
    editor = new Editor(new ItemManager(store), store)
  })

  it('copies non-text sub annotations', () => {
    const directionalVectorSubAnnotation = buildAnnotation(editor, {
      type: 'directional_vector',
      classId: 2
    })!
    const firstAnnotation = buildAnnotation(editor)!
    firstAnnotation.subAnnotations = [directionalVectorSubAnnotation]

    const attributesSubAnnotation = buildAnnotation(editor, {
      type: 'attributes',
      classId: 3
    })!
    const secondAnnotation = buildAnnotation(editor)!
    secondAnnotation.subAnnotations = [attributesSubAnnotation]

    const mergedSubAnnotations = mergeSubAnnotations(firstAnnotation, secondAnnotation)
    expect(mergedSubAnnotations).toHaveLength(1)
    expect(mergedSubAnnotations[0].id).toEqual(directionalVectorSubAnnotation.id)
  })

  it('concats text sub annotations', () => {
    const textSubAnnotation1 = buildAnnotation(editor, {
      type: 'text',
      classId: 2,
      data: { text: 'text1' }
    })!
    const firstAnnotation = buildAnnotation(editor)!
    firstAnnotation.subAnnotations = [textSubAnnotation1]

    const textSubAnnotation2 = buildAnnotation(editor, {
      type: 'text',
      classId: 2,
      data: { text: 'text2' }
    })!
    const secondAnnotation = buildAnnotation(editor)!
    secondAnnotation.subAnnotations = [textSubAnnotation2]

    const mergedSubAnnotations = mergeSubAnnotations(firstAnnotation, secondAnnotation)
    expect(mergedSubAnnotations).toHaveLength(1)
    expect((mergedSubAnnotations[0].data as Text).text).toEqual('text1 text2')
    expect((mergedSubAnnotations[0].data as Text).text).toEqual('text1 text2')
  })
})
