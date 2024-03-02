import { EditableImagePoint } from '@/engineCommon/point'
import { EnginePlugin } from '@/engineV2/managers/pluginManagerInterfaces'
import { PluginContext } from '@/engineV2/types'

/**
 * This tool is a "hotfix" tool to correct polygons
 * that have been misaligned during deployment of 2019-07-12
 * Use ctrl-shift-u and ctrl-shift-i to zoom the annotations out or in to match the image.
 * Note that this is not saved until the user does something else (like moving a poylgon)
 */

interface ZoomCorrectionPlugin extends EnginePlugin {}

const ZoomCorrection: ZoomCorrectionPlugin = {
  activate (context: PluginContext) {
    context.registerCommand('zoom_correction.in', () => {
      for (const annotation of context.editor.activeView.annotationManager.annotations) {
        if (annotation.type === 'polygon') {
          const polygon = annotation.data as {path: EditableImagePoint[];}
          polygon.path.map(p => p.mul_({ x: 0.995, y: 0.995 }))
        }
      }
      context.editor.activeView.allLayersChanged()
    })
    context.registerCommand('zoom_correction.out', () => {
      for (const annotation of context.editor.activeView.annotationManager.annotations) {
        if (annotation.type === 'polygon') {
          const polygon = annotation.data as {path: EditableImagePoint[];}
          polygon.path.map(p => p.mul_({ x: 1.005, y: 1.005 }))
        }
      }
      context.editor.activeView.allLayersChanged()
    })
  },
  deactivate (context: PluginContext) {
    for (const handle of context.handles) {
      handle.release()
    }
  }
}

export default ZoomCorrection
