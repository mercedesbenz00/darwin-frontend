import Heap from 'heap'

import Instance from './instance'
import Node from './node'

const CLOSED_LIST = 0
const OPEN_LIST = 1

let nextInstanceId = 1

export enum SIDE {
  TOP = 'TOP',
  TOP_RIGHT = 'TOP_RIGHT',
  RIGHT = 'RIGHT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  BOTTOM = 'BOTTOM',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  LEFT = 'LEFT',
  TOP_LEFT = 'TOP_LEFT'
}

export default class PathFinder {
  readonly STRAIGHT_COST = 1.0
  readonly DIAGONAL_COST = 1.4
  pointsToAvoid: { [key: string]: { [key: string]: number } } = {}
  collisionGrid: number[][] = []
  costMap: { [key: string]: number } = {}
  pointsToCost: { [key: string]: { [key: string]: number } } = {}
  directionalConditions: { [key: string]: { [key: string]: string[]} } = {}
  iterationsSoFar: number | null = null
  instances: { [key: string | number]: Instance } = {}
  instanceQueue: number[] = []
  iterationsPerCalculation = Number.MAX_VALUE
  acceptableTiles: number[] = []

  /**
    * Sets the collision grid.
    *
    * @param {Array|Number} tiles An array of numbers that represent
    * which tiles in your grid should be considered
    * acceptable, or "walkable".
    **/
  setAcceptableTiles (tiles: number[]): void {
    if (tiles instanceof Array) {
      // Array
      this.acceptableTiles = tiles
    } else if (!isNaN(parseFloat(tiles)) && isFinite(tiles)) {
      // Number
      this.acceptableTiles = [tiles]
    }
  }

  /**
    * Sets the collision grid.
    *
    * @param {Array} grid The collision grid that this instance will read from.
    * This should be a 2D Array of Numbers.
    **/
  setGrid (grid: number[][]): void {
    this.collisionGrid = grid

    // Setup cost map
    for (let y = 0; y < this.collisionGrid.length; y++) {
      for (let x = 0; x < this.collisionGrid[0].length; x++) {
        if (!this.costMap[this.collisionGrid[y][x]]) {
          this.costMap[this.collisionGrid[y][x]] = 1
        }
      }
    }
  }

  /**
    * Sets the tile cost for a particular tile type.
    *
    * @param {Number} The tile type to set the cost for.
    * @param {Number} The multiplicative cost associated with the given tile.
    **/
  setTileCost (tileType: number, cost: number): void {
    this.costMap[tileType] = cost
  }

  /**
    * Sets the an additional cost for a particular point.
    * Overrides the cost from setTileCost.
    *
    * @param {Number} x The x value of the point to cost.
    * @param {Number} y The y value of the point to cost.
    * @param {Number} The multiplicative cost associated with the given point.
    **/
  setAdditionalPointCost (x: number, y: number, cost: number): void {
    if (this.pointsToCost[y] === undefined) {
      this.pointsToCost[y] = {}
    }
    this.pointsToCost[y][x] = cost
  }

  /**
    * Remove the additional cost for a particular point.
    *
    * @param {Number} x The x value of the point to stop costing.
    * @param {Number} y The y value of the point to stop costing.
    **/
  removeAdditionalPointCost (x: number, y: number): void {
    if (this.pointsToCost[y] !== undefined) {
      delete this.pointsToCost[y][x]
    }
  }

  /**
    * Remove all additional point costs.
    **/
  removeAllAdditionalPointCosts (): void {
    this.pointsToCost = {}
  }

  /**
    * Sets a directional condition on a tile
    *
    * @param {Number} x The x value of the point.
    * @param {Number} y The y value of the point.
    * @param {Array.<String>} allowedDirections A list of all the allowed directions that can access
    * the tile.
    **/
  setDirectionalCondition (x: number, y: number, allowedDirections: string[]): void {
    if (this.directionalConditions[y] === undefined) {
      this.directionalConditions[y] = {}
    }
    this.directionalConditions[y][x] = allowedDirections
  }

  /**
    * Remove all directional conditions
    **/
  removeAllDirectionalConditions (): void {
    this.directionalConditions = {}
  }

  /**
    * Sets the number of search iterations per calculation.
    * A lower number provides a slower result, but more practical if you
    * have a large tile-map and don't want to block your thread while
    * finding a path.
    *
    * @param {Number} iterations The number of searches to prefrom per calculate() call.
    **/
  setIterationsPerCalculation (iterations: number): void {
    this.iterationsPerCalculation = iterations
  }

  /**
    * Avoid a particular point on the grid,
    * regardless of whether or not it is an acceptable tile.
    *
    * @param {Number} x The x value of the point to avoid.
    * @param {Number} y The y value of the point to avoid.
    **/
  avoidAdditionalPoint (x: number, y: number): void {
    if (this.pointsToAvoid[y] === undefined) {
      this.pointsToAvoid[y] = {}
    }
    this.pointsToAvoid[y][x] = 1
  }

  /**
    * Stop avoiding a particular point on the grid.
    *
    * @param {Number} x The x value of the point to stop avoiding.
    * @param {Number} y The y value of the point to stop avoiding.
    **/
  stopAvoidingAdditionalPoint (x: number, y: number): void {
    if (this.pointsToAvoid[y] !== undefined) {
      delete this.pointsToAvoid[y][x]
    }
  }

  /**
    * Stop avoiding all additional points on the grid.
    **/
  stopAvoidingAllAdditionalPoints (): void {
    this.pointsToAvoid = {}
  }

  /**
    * Find a path.
    *
    * @param {Number} startX The X position of the starting point.
    * @param {Number} startY The Y position of the starting point.
    * @param {Number} endX The X position of the ending point.
    * @param {Number} endY The Y position of the ending point.
    * @param {Function} callback A function that is called when your path
    * is found, or no path is found.
    * @return {Number} A numeric, non-zero value which identifies the created instance.
    * This value can be passed to cancelPath to cancel the path calculation.
    **/
  findPath (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    callback: (path: { x: number, y: number }[] | null) => void
  ): number | null {
    // Wraps the callback for sync vs async logic
    const callbackWrapper = (result: { x: number, y: number }[] | null): void => {
      setTimeout(function () {
        callback(result)
      })
    }

    // No acceptable tiles were set
    if (this.acceptableTiles === undefined) {
      throw new Error("You can't set a path without first calling setAcceptableTiles().")
    }
    // No grid was set
    if (this.collisionGrid === undefined) {
      throw new Error("You can't set a path without first calling setGrid().")
    }

    // Start or endpoint outside of scope.
    if (startX < 0 || startY < 0 || endX < 0 || endY < 0 ||
      startX > this.collisionGrid[0].length - 1 || startY > this.collisionGrid.length - 1 ||
      endX > this.collisionGrid[0].length - 1 || endY > this.collisionGrid.length - 1) {
      throw new Error('Your start or end point is outside the scope of your grid.')
    }

    // Start and end are the same tile.
    if (startX === endX && startY === endY) {
      callbackWrapper([])
      return null
    }

    // End point is not an acceptable tile.
    const endTile = this.collisionGrid[endY][endX]
    let isAcceptable = false
    for (let i = 0; i < this.acceptableTiles.length; i++) {
      if (endTile === this.acceptableTiles[i]) {
        isAcceptable = true
        break
      }
    }

    if (isAcceptable === false) {
      callbackWrapper(null)
      return null
    }

    // Create the instance
    const instance = new Instance()
    instance.openList = new Heap((nodeA, nodeB) => {
      return nodeA.bestGuessDistance() - nodeB.bestGuessDistance()
    })
    instance.isDoneCalculating = false
    instance.nodeHash = {}
    instance.startX = startX
    instance.startY = startY
    instance.endX = endX
    instance.endY = endY
    instance.callback = callbackWrapper

    instance.openList.push(
      this.coordinateToNode(
        instance,
        instance.startX,
        instance.startY,
        null,
        this.STRAIGHT_COST
      )
    )

    const instanceId = nextInstanceId++
    this.instances[instanceId] = instance
    this.instanceQueue.push(instanceId)
    return instanceId
  }

  /**
   * Cancel a path calculation.
   *
   * @param {Number} instanceId The instance ID of the path being calculated
   * @return {Boolean} True if an instance was found and cancelled.
   **/
  cancelPath (instanceId: number): boolean {
    if (instanceId in this.instances) {
      delete this.instances[instanceId]
      // No need to remove it from instanceQueue
      return true
    }
    return false
  }

  /**
   * Cancel all paths calculation.
   **/
  cancelAllPaths (): void {
    Object.keys(this.instances).forEach(instanceId => {
      delete this.instances[instanceId]
    })
  }

  /**
    * This method steps through the A* Algorithm in an attempt to
    * find your path(s). It will search 4-8 tiles (depending on diagonals) for every calculation.
    * You can change the number of calculations done in a call by using
    * .setIteratonsPerCalculation().
    **/
  calculate (): void {
    if (
      this.instanceQueue.length === 0 ||
      this.collisionGrid === undefined ||
      this.acceptableTiles === undefined
    ) {
      return
    }

    for (
      this.iterationsSoFar = 0;
      this.iterationsSoFar < this.iterationsPerCalculation;
      this.iterationsSoFar++
    ) {
      if (this.instanceQueue.length === 0) {
        return
      }

      const instanceId = this.instanceQueue[0]
      const instance: Instance = this.instances[instanceId]
      if (typeof instance == 'undefined') {
        // This instance was cancelled
        this.instanceQueue.shift()
        continue
      }

      if (!instance.openList) { return }

      // Couldn't find a path.
      if (instance.openList.size() === 0) {
        instance.callback(null)
        delete this.instances[instanceId]
        this.instanceQueue.shift()
        continue
      }

      const searchNode: Node = instance.openList.pop() as Node

      // Handles the case where we have found the destination
      if (instance.endX === searchNode.x && instance.endY === searchNode.y) {
        const path = []
        path.push({ x: searchNode.x, y: searchNode.y })
        let parent = searchNode.parent
        while (parent != null) {
          path.push({ x: parent.x, y: parent.y })
          parent = parent.parent
        }
        path.reverse()
        const ip = path
        instance.callback(ip)
        delete this.instances[instanceId]
        this.instanceQueue.shift()
        continue
      }

      searchNode.list = CLOSED_LIST

      if (searchNode.y > 0) {
        this.checkAdjacentNode(instance, searchNode,
          0, -1, this.STRAIGHT_COST * this.getTileCost(searchNode.x, searchNode.y - 1))
      }
      if (searchNode.x < this.collisionGrid[0].length - 1) {
        this.checkAdjacentNode(instance, searchNode,
          1, 0, this.STRAIGHT_COST * this.getTileCost(searchNode.x + 1, searchNode.y))
      }
      if (searchNode.y < this.collisionGrid.length - 1) {
        this.checkAdjacentNode(instance, searchNode,
          0, 1, this.STRAIGHT_COST * this.getTileCost(searchNode.x, searchNode.y + 1))
      }
      if (searchNode.x > 0) {
        this.checkAdjacentNode(instance, searchNode,
          -1, 0, this.STRAIGHT_COST * this.getTileCost(searchNode.x - 1, searchNode.y))
      }
    }
  }

  private checkAdjacentNode (
    instance: Instance,
    searchNode: Node,
    x: number,
    y: number,
    cost: number
  ): void {
    const adjacentCoordinateX = searchNode.x + x
    const adjacentCoordinateY = searchNode.y + y

    if (
      (
        this.pointsToAvoid[adjacentCoordinateY] === undefined ||
        this.pointsToAvoid[adjacentCoordinateY][adjacentCoordinateX] === undefined
      ) &&
      this.isTileWalkable(
        this.collisionGrid,
        this.acceptableTiles,
        adjacentCoordinateX,
        adjacentCoordinateY,
        searchNode
      )
    ) {
      const node = this.coordinateToNode(instance, adjacentCoordinateX,
        adjacentCoordinateY, searchNode, cost)

      if (!instance.openList) { return }

      if (node.list === undefined) {
        node.list = OPEN_LIST
        instance.openList.push(node)
      } else if (searchNode.costSoFar + cost < node.costSoFar) {
        node.costSoFar = searchNode.costSoFar + cost
        node.parent = searchNode
        instance.openList.updateItem(node)
      }
    }
  }

  // Helpers
  private isTileWalkable (
    collisionGrid: number[][],
    acceptableTiles: number[],
    x: number,
    y: number,
    sourceNode: Node
  ): boolean {
    const directionalCondition = this.directionalConditions[y] && this.directionalConditions[y][x]
    if (directionalCondition) {
      const direction = this.calculateDirection(sourceNode.x - x, sourceNode.y - y)
      const directionIncluded = () => {
        for (let i = 0; i < directionalCondition.length; i++) {
          if (directionalCondition[i] === direction) { return true }
        }
        return false
      }
      if (!directionIncluded()) { return false }
    }
    for (let i = 0; i < acceptableTiles.length; i++) {
      if (collisionGrid[y][x] === acceptableTiles[i]) {
        return true
      }
    }

    return false
  }

  /**
   * -1, -1 | 0, -1  | 1, -1
   * -1,  0 | SOURCE | 1,  0
   * -1,  1 | 0,  1  | 1,  1
   */
  calculateDirection (diffX: number, diffY: number): SIDE {
    if (diffX === 0 && diffY === -1) {
      return SIDE.TOP
    } else if (diffX === 1 && diffY === -1) {
      return SIDE.TOP_RIGHT
    } else if (diffX === 1 && diffY === 0) {
      return SIDE.RIGHT
    } else if (diffX === 1 && diffY === 1) {
      return SIDE.BOTTOM_RIGHT
    } else if (diffX === 0 && diffY === 1) {
      return SIDE.BOTTOM
    } else if (diffX === -1 && diffY === 1) {
      return SIDE.BOTTOM_LEFT
    } else if (diffX === -1 && diffY === 0) {
      return SIDE.LEFT
    } else if (diffX === -1 && diffY === -1) {
      return SIDE.TOP_LEFT
    }
    throw new Error('These differences are not valid: ' + diffX + ', ' + diffY)
  }

  getTileCost (x: number, y: number): number {
    return (this.pointsToCost[y]?.[x]) || this.costMap[this.collisionGrid[y][x]]
  }

  coordinateToNode (
    instance: Instance,
    x: number,
    y: number,
    parent: Node | null,
    cost: number
  ): Node {
    if (instance.nodeHash[y] !== undefined) {
      if (instance.nodeHash[y][x] !== undefined) {
        return instance.nodeHash[y][x]
      }
    } else {
      instance.nodeHash[y] = {}
    }
    const simpleDistanceToTarget = this.getDistance(x, y, instance.endX, instance.endY)
    let costSoFar
    if (parent !== null) {
      costSoFar = parent.costSoFar + cost
    } else {
      costSoFar = 0
    }
    const node = new Node(parent, x, y, costSoFar, simpleDistanceToTarget)
    instance.nodeHash[y][x] = node
    return node
  }

  getDistance (x1: number, y1: number, x2: number, y2: number): number {
    const dx = Math.abs(x1 - x2)
    const dy = Math.abs(y1 - y2)
    return Math.min(dx, dy)
  }
}
