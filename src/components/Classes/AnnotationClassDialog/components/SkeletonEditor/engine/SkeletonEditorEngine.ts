import { v4 as uuidv4 } from 'uuid'

import { SkeletonMetadata } from '@/store/types'

import SkeletonEditorRenderer from './SkeletonEditorRenderer'
import SkeletonEditorSerializer from './SkeletonEditorSerializer'
import { SkeletonNodeType, SkeletonEdgeType, NODE_SIZE } from './types'

export default class SkeletonEditorEngine {
  private repaintHandle: number | null = null
  private editing?: boolean
  private scale: number = 1
  private serializer: SkeletonEditorSerializer = new SkeletonEditorSerializer(this)
  private renderer: SkeletonEditorRenderer = new SkeletonEditorRenderer(this)
  private originalRawData: SkeletonMetadata | null = null

  public canvas!: HTMLCanvasElement
  public edges: SkeletonEdgeType[] = []
  public nodes: SkeletonNodeType[] = []
  public strokeColor: string = 'rgb(49, 245, 202)'
  public width: number = 0
  public height: number = 0

  private onChange: (data: SkeletonMetadata) => void

  constructor (onChange: (data: SkeletonMetadata) => void) {
    this.onChange = onChange
  }

  /**
   * Returns true if no edges, no nodes
   */
  public get isEmpty (): boolean {
    return this.edges.length === 0 && this.nodes.length === 0
  }

  public get hasMovingNode (): boolean {
    return !!this.movingNode
  }

  public get movingNode (): SkeletonNodeType | undefined {
    return this.nodes.find(node => node.isMoving)
  }

  public get hasDrawingEdge (): boolean {
    return !!this.drawingEdge
  }

  public get drawingEdge (): SkeletonEdgeType | undefined {
    return this.edges.find(edge => edge.isDrawing)
  }

  // The node is highlighted when the mouse is over its node's area
  public get highlightedNode (): SkeletonNodeType | undefined {
    return this.nodes.find(node => node.isHighlighted)
  }

  public setMainCanvas (canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.resetDimensions()
    this.addListeners()
  }

  public getRawData (): SkeletonMetadata {
    return this.serializer.serialize()
  }

  public setRawData (rawData: SkeletonMetadata): void {
    this.originalRawData = rawData
    this.serializer.deserialize(rawData)
    this.requestRepaint()
  }

  public setNodes (nodes: SkeletonNodeType[]): void {
    this.nodes = nodes
  }

  public setEdges (edges: SkeletonEdgeType[]): void {
    this.edges = edges
  }

  private cancelAllMovingNodes (): void {
    const { nodes } = this
    nodes.forEach(node => { node.isMoving = false })
  }

  public setMovingNode (node: SkeletonNodeType): void {
    this.cancelAllMovingNodes()
    node.isMoving = true
  }

  public startDrawingEdgeFromNode (node: SkeletonNodeType): void {
    this.edges.push({
      internalId: uuidv4(),
      nodes: [
        node,
        {
          position: { x: node.position.x, y: node.position.y },
          isMoving: false,
          isHighlighted: false
        }
      ],
      isDrawing: true
    })
  }

  private completeDrawingEdge (): void {
    const { edges, highlightedNode, drawingEdge } = this
    if (!drawingEdge || !highlightedNode) { return }

    drawingEdge.isDrawing = false

    // If it is creating a new edge, create a new one.
    // If there is an existing edge between the same nodes, remove it.
    const existingEdge = edges.find(
      edge => edge.internalId !== drawingEdge.internalId &&
        edge.nodes.every(node => (
          node.internalId === drawingEdge.nodes[0].internalId ||
          node.internalId === highlightedNode.internalId
        ))
    )

    if (existingEdge) {
      this.removeEdge(existingEdge)
      this.removeEdge(drawingEdge)
    } else {
      drawingEdge.nodes.splice(1, 1, highlightedNode)
    }

    this.refreshHighlightedNodes()
    this.requestRepaint()
    this.onChange(this.getRawData())
  }

  private cancelDrawingEdge (): void {
    const { edges, drawingEdge } = this
    if (!drawingEdge) { return }

    const idx = edges.findIndex(edge => edge.internalId === drawingEdge.internalId)
    edges.splice(idx, 1)

    this.requestRepaint()
    this.onChange(this.getRawData())
  }

  private isPointOverNode (node: SkeletonNodeType, point: { x: number, y: number }): boolean {
    const { x, y } = node.position
    const { scale } = this
    return Math.abs(x - point.x) < NODE_SIZE * scale &&
      Math.abs(y - point.y) < NODE_SIZE * scale
  }

  private refreshHighlightedNodes (point?: { x: number, y: number }): void {
    this.nodes.forEach(node => {
      node.isHighlighted = point ? this.isPointOverNode(node, point) : false
    })
  }

  public addNewNodeFromPosition (position: { x: number, y: number }): void {
    const newNode = {
      internalId: uuidv4(),
      position,
      label: `${this.nodes.length + 1}`,
      isMoving: false,
      isHighlighted: false
    }
    this.nodes.push(newNode)
  }

  public removeNode (node: SkeletonNodeType): void {
    const { edges, nodes } = this
    // Removing related edges
    for (let i = edges.length - 1; i >= 0; i--) {
      const edge = edges[i]
      if (edge.nodes.includes(node)) {
        edges.splice(i, 1)
      }
    }

    const idx = nodes.findIndex(n => n.internalId === node.internalId)
    nodes.splice(idx, 1)

    this.requestRepaint()
    this.onChange(this.getRawData())
  }

  private removeEdge (edge: SkeletonEdgeType): void {
    const { edges } = this
    const idx = edges.findIndex(e => e.internalId === edge.internalId)
    edges.splice(idx, 1)
  }

  public setEditing (editing: boolean): void {
    this.editing = editing
  }

  public setStrokeColor (color: string): void {
    this.strokeColor = color === 'auto' ? 'rgb(49, 245, 202)' : color
  }

  public resetDimensions (): void {
    if (!this.canvas) { return }
    this.width = this.canvas.clientWidth
    this.height = this.canvas.clientHeight
    this.canvas.width = this.width
    this.canvas.height = this.height

    this.originalRawData && this.setRawData(this.originalRawData)
  }

  public setScale (scale: number): void {
    this.scale = scale
  }

  public reset (): void {
    this.removeListeners()
  }

  private addListeners (): void {
    if (!this.canvas) { return }
    if (!this.canvas.parentElement) { return }

    this.canvas.parentElement.addEventListener('mouseup', this.onMouseUp.bind(this))

    this.canvas.addEventListener('mousedown', this.onCanvasMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', this.onCanvasMouseMove.bind(this))

    document.addEventListener('keydown', this.onKeydown.bind(this))
  }

  private removeListeners (): void {
    if (!this.canvas) { return }
    if (!this.canvas.parentElement) { return }

    this.canvas.parentElement.removeEventListener('mouseup', this.onMouseUp.bind(this))

    this.canvas.removeEventListener('mousedown', this.onCanvasMouseDown.bind(this))
    this.canvas.removeEventListener('mousemove', this.onCanvasMouseMove.bind(this))

    document.removeEventListener('keydown', this.onKeydown.bind(this))
  }

  onMouseUp (event: MouseEvent): void {
    if (!this.canvas.parentElement) { return }
    if (!this.canvas.parentElement.contains(event.target as HTMLElement)) { return }

    const node = this.movingNode
    if (!node) { return }

    this.cancelAllMovingNodes()
  }

  onCanvasMouseDown (event: MouseEvent): void {
    const { editing, highlightedNode, movingNode, drawingEdge } = this

    const shouldCompleteDrawingEdge = !!drawingEdge && !!highlightedNode
    const shouldCancelDrawingEdge = !!drawingEdge && !highlightedNode
    const isCreatingNewNode = !drawingEdge && !movingNode && !editing

    if (shouldCompleteDrawingEdge) { this.completeDrawingEdge() }
    if (shouldCancelDrawingEdge) { this.cancelDrawingEdge() }
    if (isCreatingNewNode) { this.addNewNodeFromPosition({ x: event.offsetX, y: event.offsetY }) }
  }

  onCanvasMouseMove (event: MouseEvent): void {
    const { movingNode, drawingEdge } = this
    if (drawingEdge) {
      drawingEdge.nodes[1].position.x = event.offsetX
      drawingEdge.nodes[1].position.y = event.offsetY

      this.refreshHighlightedNodes({ x: event.offsetX, y: event.offsetY })
      this.requestRepaint()
    } else if (movingNode) {
      movingNode.position.x = event.offsetX
      movingNode.position.y = event.offsetY
      this.requestRepaint()
    }
    this.onChange(this.getRawData())
  }

  onKeydown (event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation()
      this.cancelDrawingEdge()
    }
  }

  public requestRepaint (): boolean {
    if (this.repaintHandle) { window.cancelAnimationFrame(this.repaintHandle) }

    this.repaintHandle = window.requestAnimationFrame(() => {
      this.renderer.render()
      this.repaintHandle = null
    })

    return true
  }
}
