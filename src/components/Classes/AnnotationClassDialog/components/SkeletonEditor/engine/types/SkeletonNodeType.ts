export const NODE_SIZE = 15
export type SkeletonNodeType = {
  internalId?: string;
  position: { x: number; y: number };
  label?: string;
  isMoving: boolean
  isHighlighted: boolean
}
