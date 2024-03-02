import { DeletableVertexContext, DeleteVertexContext } from '@/engine/plugins/edit/types'

export const isDeleteVertexContext = (
  c: DeletableVertexContext
): c is DeleteVertexContext => !!c && c.action === 'deleteVertex'
