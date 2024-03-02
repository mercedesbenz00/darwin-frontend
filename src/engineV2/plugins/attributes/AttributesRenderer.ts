import { View, Annotation, AnnotationTypeRenderer, ILayer } from '@/engineV2/models'
import { DrawCallback } from '@/engineV2/models/layers'

export class AttributesRenderer extends AnnotationTypeRenderer {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  render (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
    annotation: Annotation,
    _: boolean
  ): void {}
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
