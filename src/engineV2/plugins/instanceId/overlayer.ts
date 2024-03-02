import { chromaHash } from '@/components/WorkView/utils'
import { Editor } from '@/engineV2/editor'
import { AnnotationOverlayer } from '@/engineV2/managers'
import { Annotation, AnnotationData } from '@/engineV2/models/annotation'
import { InstanceID } from '@/engineV2/plugins/instanceId/types'
import { addZeros, formatLongNumericString } from '@/utils'

export type OverlayRender = {
  text: string
  style: string
  borderStyle: string
  color1Style: string
  color2Style: string
  color3Style: string
}

export const getOverlayRender = (text: string, colors: string[]): OverlayRender => ({
  text,
  style: [
    'background: white',
    'min-width: 1.25rem',
    'text-align: center',
    'border-radius: 2px 2px 5px 5px',
    'line-height: 0.8125rem',
    'padding-top: 1px'
  ].join('; '),
  borderStyle: 'width: 100%; height: 4px; margin-bottom: -2px; border-radius: 0 0 5px 5px;',
  color1Style: `background: #${colors[0]}; border-radius: 5px 0 0 0`,
  color2Style: `background: #${colors[1]};`,
  color3Style: `background: #${colors[2]}; border-radius: 0 5px 0 0`
})

export const overlayer: AnnotationOverlayer = {
  render (editor: Editor, annotation: Annotation, data: AnnotationData): OverlayRender[] {
    const instanceIDData = data as InstanceID
    const text = formatLongNumericString(`${instanceIDData.value}`)
    const colors = chromaHash(addZeros(instanceIDData.value, 9))
    return [getOverlayRender(text, colors)]
  }
}
