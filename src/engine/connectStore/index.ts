import { Store } from 'vuex'

import { Editor } from '@/engine/editor'
import { RootState } from '@/store/types'

import { linkAnnotations } from './linkAnnotations'
import { linkDataset } from './linkDataset'
import { linkEditor } from './linkEditor'
import { linkModels } from './linkModels'
import { linkStage } from './linkStage'
import { linkThreads } from './linkThreads'
import { linkTooling } from './linkTooling'

export const connectStore = (store: Store<RootState>, editor: Editor): Function => {
  const unsubscribes: Function[] = []

  unsubscribes.push(linkAnnotations(store, editor))
  unsubscribes.push(linkStage(store, editor))
  unsubscribes.push(linkThreads(store, editor))
  unsubscribes.push(linkEditor(store, editor))
  unsubscribes.push(linkTooling(store, editor))
  unsubscribes.push(linkModels(store, editor))
  unsubscribes.push(linkDataset(store, editor))

  return (): void => {
    unsubscribes.forEach(f => f())
    unsubscribes.length = 0
  }
}
