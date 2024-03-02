import { AutoAnnotateInferencePayload, Click, InferenceData } from '@/engineCommon/backend'
import { Point } from '@/engineCommon/point'
import { Rectangle } from '@/engineCommon/rectangle'
import { Editor } from '@/engineV2/editor'
import { PointMapping } from '@/engineV2/plugins/click/types'

import { ClickImagePayload, isPreselectedModelAutoAnnotate } from '.'

const mappingOnClick = (click: Click, mapping: PointMapping<'Image'>): Click => {
  const convert = mapping.forward(new Point({ x: click.x, y: click.y }))
  return {
    type: click.type,
    x: convert.x,
    y: convert.y
  }
}

export const buildAutoAnnotateRequestPayload = (
  editor: Editor,
  clickImagePayload: ClickImagePayload,
  bbox: Rectangle<'Image'>,
  clicks: Click[],
  threshold?: number
) => {
  const { imagePayload, mapping } = clickImagePayload

  if (isPreselectedModelAutoAnnotate(editor)) {
    const data = {
      bbox,
      clicks: clicks.map(click => mappingOnClick(click, mapping)),
      threshold
    }
    const requestPayload: InferenceData = { image: imagePayload, data }

    // A dicom image needs window levels included
    if (editor.activeView.fileManager.isDicom) {
      requestPayload.data.dicom = {
        window_low: editor.activeView.imageFilter.windowLevels[0],
        window_high: editor.activeView.imageFilter.windowLevels[1]
      }
    }
    return requestPayload
  }

  const requestPayload: AutoAnnotateInferencePayload = {
    image: imagePayload,
    bbox,
    threshold
  }

  // A dicom image needs window levels included
  if (editor.activeView.fileManager.isDicom) {
    requestPayload.dicom = {
      window_low: editor.activeView.imageFilter.windowLevels[0],
      window_high: editor.activeView.imageFilter.windowLevels[1]
    }
  }

  return requestPayload
}
