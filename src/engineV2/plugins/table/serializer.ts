import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models'

import { Table, TableCell } from './types'

/* eslint-disable camelcase */
interface SerializedTable {
  table: {
    bounding_box: { x: number, y: number, w: number, h: number }
    cells: TableCell[]
  }
}

const isTable = (data: AnnotationData): data is Table => 'boundingBox' in data && 'cells' in data

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): SerializedTable {
    if (!isTable(data)) { throw new Error('Invalid annotation given to table serializer') }

    const { boundingBox, cells } = data
    return {
      table: {
        bounding_box: boundingBox,
        cells
      }
    }
  },

  deserialize (rawData: SerializedTable): AnnotationData {
    const { bounding_box, cells } = rawData.table
    return {
      boundingBox: bounding_box,
      cells
    }
  }
}
/* eslint-enable camelcase */
