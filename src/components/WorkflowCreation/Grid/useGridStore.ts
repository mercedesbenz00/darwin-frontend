import { createInjectionState } from '@vueuse/shared'
import { Ref } from 'vue'

import { SIDE } from '@/components/WorkflowCreation/Grid/PathFinder'

import { ItemBBox } from './types'

type Props = {
  scale: Ref<number>,
  cellWidth: number
  cellHeight: number,
  setBBox: (id: string, bbox: ItemBBox) => void,
  itemFocus: () => void,
  itemBlur: () => void,
  unregister: (id: string) => void,
  setEdgePosition: (
    edgeId: string,
    position: { x: number, y: number },
    accessSide: SIDE.LEFT | SIDE.RIGHT
  ) => void
}

const [
  useProvideGridStore,
  useGridStore
] = createInjectionState((initialValue: Props) => {
  return {
    ...initialValue
  }
})

export {
  useGridStore,
  useProvideGridStore
}
