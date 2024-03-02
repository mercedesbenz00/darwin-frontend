export default class Node {
  public list: number | undefined

  constructor (
    public parent: Node | null,
    public x: number,
    public y: number,
    public costSoFar: number,
    public simpleDistanceToTarget: number,
  ) {}

  /**
   * @return {Number} Best guess distance of a cost using this node.
   **/
  bestGuessDistance (): number {
    return this.costSoFar + this.simpleDistanceToTarget
  }
}
