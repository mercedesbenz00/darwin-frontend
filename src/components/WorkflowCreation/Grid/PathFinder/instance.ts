import Heap from 'heap'

import Node from './node'

export default class Instance {
  isDoneCalculating: boolean = true
  pointsToAvoid: { [key: string]: number } = {}
  startX: number = 0
  callback: (path: { x: number, y: number}[] | null) => void = () => {}
  startY: number = 0
  endX: number = 0
  endY: number = 0
  nodeHash: { [key: string]: { [key: string]: Node } } = {}
  openList?: Heap<Node>
}
