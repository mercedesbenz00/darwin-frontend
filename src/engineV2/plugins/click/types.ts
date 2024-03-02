import { Point } from '@/engineCommon/point'
import { RectangleEditablePoint } from '@/engineCommon/rectangle'

export type CornerPosition = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'

export type CornerInfo = {
  corner: RectangleEditablePoint<'Image'>
  position: CornerPosition
}

/**
 * Duplicate of TrainedModelPayload
 *
 * Intentionally duplicated to simulate plugin/tool being an external script
 */
export type Model = {
  /* eslint-disable camelcase */
  id: string,
  name: string,
  trained_model_id: string
  /* eslint-enable camelcase */
}

export type PointMapping<T> = {
  forward: (point: Point<T>) => Point<T>
  backward: (point: Point<T>) => Point<T>
}
