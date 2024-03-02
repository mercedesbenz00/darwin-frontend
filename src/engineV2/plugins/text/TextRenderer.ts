import { Annotation, AnnotationTypeRenderer, ILayer } from '@/engineV2/models'
import { DrawCallback } from '@/engineV2/models/layers'
import { View } from '@/engineV2/views'

export class TextRenderer extends AnnotationTypeRenderer {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  render (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
    annotation: Annotation,
    inferred: boolean
  ): void {}
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
