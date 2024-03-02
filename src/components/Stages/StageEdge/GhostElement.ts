import { EdgeType } from '@/components/Stages/StageEdge/types'

export type GhostElementArgs = {
  target: HTMLDivElement
  type: EdgeType
}

export default class GhostElement {
  ghostElementId: string
  ghostElement: HTMLDivElement | null
  edgeType: GhostElementArgs['type']
  target: GhostElementArgs['target']

  constructor ({ target, type }: GhostElementArgs) {
    this.edgeType = type
    this.target = target
    this.ghostElementId = 'drag-point-g'
    this.ghostElement = null
  }

  initElement (): HTMLDivElement {
    const { ghostElementId, edgeType } = this

    const element = document.createElement('div')
    element.setAttribute('id', ghostElementId)
    element.classList.add('edge-ghost')
    element.classList.add(edgeType === EdgeType.IN ? 'edge-ghost__in' : 'edge-ghost__out')

    return element
  }

  create (): HTMLDivElement {
    this.ghostElement = this.initElement()
    this.target.parentNode?.insertBefore(this.ghostElement, this.target)

    return this.ghostElement
  }

  destroy (): void {
    this.ghostElement?.remove()
    this.ghostElement = null
  }
}
