import { AnnotationData } from '@/engineV2/models'

export const TABLE_ANNOTATION_TYPE = 'table'

export interface Table extends AnnotationData {
  cells: TableCell[]
  rowOffsets: number[]
  colOffsets: number[]
}

/* eslint-disable camelcase */
export interface TableCell {
  id: string
  row: number
  col: number
  row_span: number
  col_span: number
  bounding_box: { x: number, y: number, w: number, h: number },
  is_header: boolean
}
/* eslint-enable camelcase */
