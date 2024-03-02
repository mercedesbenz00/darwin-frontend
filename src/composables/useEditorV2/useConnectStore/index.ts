import { Store } from 'vuex'

import { useEditorV2 } from '@/composables/useEditorV2'
import { RootState } from '@/store/types'

import { linkDataset } from './linkDataset'
import { linkDatasetItem } from './linkDatasetItem'
import { linkEditor } from './linkEditor'
import { linkModels } from './linkModels'
import { linkStage } from './linkStage'
import { linkTooling } from './linkTooling'
import { useLinkAnnotations } from './useLinkAnnotations'
import { useLinkComments } from './useLinkComments'

export const useConnectStore = (store: Store<RootState>): Function => {
  const { resolveEditor } = useEditorV2()
  const editor = resolveEditor()
  if (!editor) { throw new Error('Editor was not injected into the app') }

  const unsubscribes: Function[] = []

  unsubscribes.push(linkDatasetItem(store, editor.value))
  unsubscribes.push(useLinkAnnotations(store, editor.value))
  unsubscribes.push(linkStage(store, editor.value))
  unsubscribes.push(useLinkComments(store, editor.value))
  unsubscribes.push(linkEditor(store, editor.value))
  unsubscribes.push(linkTooling(store, editor.value))
  unsubscribes.push(linkModels(store, editor.value))
  unsubscribes.push(linkDataset(store, editor.value))

  return (): void => {
    unsubscribes.forEach(f => f())
    unsubscribes.length = 0
  }
}
