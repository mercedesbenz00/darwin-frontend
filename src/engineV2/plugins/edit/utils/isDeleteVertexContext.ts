import { DeletableVertexContext, DeleteVertexContext } from '@/engineV2/plugins/edit/types'

export const isDeleteVertexContext = (
  c: DeletableVertexContext
): c is DeleteVertexContext => !!c && c.action === 'deleteVertex'
