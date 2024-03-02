import { PluginContext } from '@/engine/editor'
import { EnginePlugin } from '@/engine/managers'

import { CommentatorRenderer } from './CommentatorRenderer'
import commentatorSerializer from './commentatorSerializer'
import { tool } from './tool'

const commentator: EnginePlugin = {
  activate (context: PluginContext) {
    context.registerAnnotationRenderer('commentator', new CommentatorRenderer(context.editor))
    context.registerSerializer('commentator', commentatorSerializer)
    context.registerTool('commentator', tool)
  },
  deactivate (context: PluginContext) {
    context.unregisterAnnotationRenderer('commentator')
    context.unregisterSerializer('commentator')
    context.unregisterTool('commentator')

    for (const handle of context.handles) {
      handle.release()
    }

    // TODO: deregister the tool and annotation type
  }
}

export default commentator
