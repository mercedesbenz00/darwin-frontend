import { maybeSimplifyPolygon } from '@/engineCommon/algebra'
import { Click } from '@/engineCommon/backend'
import { IPoint, Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { addAnnotationAction } from '@/engineV2/actions'
import { calcCentroid } from '@/engineV2/graphics'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { AutoAnnotateData } from '@/engineV2/models/annotation'
import { ClickerTool } from '@/engineV2/plugins/click/ClickerTool'
import { Polygon } from '@/engineV2/plugins/polygon/types'
import { retrievePolygonData } from '@/engineV2/plugins/polygon/utils/retrievePolygonData'

import { payloadRelativeToCentroid } from './payloadRelativeToCentroid'
import { resolveAnnotationPath } from './resolveAnnotationPath'
import { retrieveAutoAnnotateData } from './retrieveAutoAnnotateData'
import { updateClickerData } from './updateClickerData'
import { validatePath } from './validatePath'

/**
 * Commits an annotation which has been inferred by a model.
 * @param {ClickerTool} clickTool The clicker tool context
 * @param {string} modelId Id of the model the inference ran for
 * @param {Click[]} clicks Array of editor-space clicks used to get the inference result
 * @param {Rectangle<'Image'>} bbox Editor-space bounding box used to get the inference result
 * @param {IPoint[]} path Path from the inference result, converted to editor space
 */
export const addInferredAnnotation = async (
  clickTool: ClickerTool,
  modelId: string,
  clicks: Click[],
  bbox: Rectangle<'Image'>,
  path: IPoint[]
): Promise<void> => {
  const { context } = clickTool
  if (!context) {
    throw new Error('Clicker tool has no context. It might not have been properly initialized')
  }

  if (!validatePath(context, path)) { return }

  const newPolygon = { path: path.map(point => new Point<'Image'>(point)) }

  // epsilon on document serves as a debugging tool in production
  const epsilon: number =
    (document as any).darwin_epsilon || context.editor.autoAnnotateManager.clickerEpsilon

  // simplified polygon is computed for sending to clicker
  const simplifiedPath = maybeSimplifyPolygon(path, epsilon)
  const polygon: Polygon = { path: resolveAnnotationPath(context, simplifiedPath) }

  const centroidRelativePayload = payloadRelativeToCentroid(
    { clicks, bbox },
    calcCentroid(polygon.path)
  )

  const autoAnnotateData: AutoAnnotateData = {
    clicks: centroidRelativePayload.clicks,
    bbox: centroidRelativePayload.bbox,
    model: modelId
  }

  clickTool.actionGroup = clickTool.actionGroup || context.editor.actionManager.createGroup()

  const { currentAnnotation } = clickTool

  if (currentAnnotation) {
    // keep copy of relevant old data, for undo action
    const previousPolygon = clickTool.currentPolygon

    const previousAutoAnnotateData = retrieveAutoAnnotateData(
      currentAnnotation.id,
      context.editor.activeView
    )

    const previousPolygonData = retrievePolygonData(currentAnnotation, context.editor)

    // Store id, so we can track down the annotation for do/undo
    const { id } = currentAnnotation

    // Store old clicks, so we can set them back on undo
    const previousClicks = clickTool.currentClicks

    clickTool.actionGroup.do({
      do (): Promise<boolean> {
        const match = context.editor.activeView.annotationManager.getAnnotation(id)
        if (!match) { return Promise.resolve(false) }

        // Force the new annotation to not be highlighted or selected
        context.editor.activeView.annotationManager.deselectAllAnnotations()

        const updated = updateClickerData(
          match,
          { path: polygon.path, additional_paths: [] },
          autoAnnotateData,
          context
        )

        clickTool.currentAnnotation = updated
        clickTool.currentPolygon = newPolygon
        clickTool.currentClicks = clicks
        clickTool.currentVisibleClicks = clickTool.currentClicks

        context.editor.activeView.annotationManager.updateAnnotation(updated)
        if (FeatureFlagsManager.isOffLayerV2) {
          context.editor.activeView.annotationsLayer.changed()
        }
        return Promise.resolve(true)
      },

      undo (): Promise<boolean> {
        const match = context.editor.activeView.annotationManager.getAnnotation(id)
        if (!match) { return Promise.resolve(false) }

        const updated = previousAutoAnnotateData && previousPolygonData
          ? updateClickerData(match, previousPolygonData, previousAutoAnnotateData, context)
          : match

        context.editor.activeView.annotationManager.updateAnnotation(updated)

        clickTool.currentAnnotation = updated
        clickTool.currentPolygon = previousPolygon
        clickTool.currentClicks = previousClicks
        clickTool.currentVisibleClicks = clickTool.currentClicks
        if (FeatureFlagsManager.isOffLayerV2) {
          context.editor.activeView.annotationsLayer.changed()
        }

        return Promise.resolve(true)
      }
    })
  } else {
    const annotation =
      await context.editor.activeView.annotationManager.prepareAnnotationForCreation(
        { type: 'polygon', data: polygon },
        { clicker: autoAnnotateData }
      )

    if (!annotation) { return }

    const addAction = addAnnotationAction(context.editor.activeView, annotation)

    clickTool.actionGroup.do({
      do (): Promise<boolean> {
        addAction.do()
        clickTool.currentAnnotation = annotation
        clickTool.currentPolygon = newPolygon
        /**
         * HACK: ensures the clicker UI will remain open, even through stage self-assignment
         * We need to unset initialAnnotationData, or there will be 2 global actions that
         * user needs to undo to remove the annotation after clicker is closed
         * - one to undo all the points and bounding box updates
         * - one to delete the annotation
         */
        context.editor.callCommand('clicker_tool.resume')
        clickTool.initialAnnotationData = undefined

        return Promise.resolve(true)
      },
      undo (): Promise<boolean> {
        addAction.undo()
        clickTool.reset(context)

        return Promise.resolve(true)
      }
    })
  }
}
