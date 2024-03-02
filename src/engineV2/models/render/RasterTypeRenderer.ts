import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { Annotation } from '@/engineV2/models/annotation'
import { ILayer } from '@/engineV2/models/layers/types'
import { Raster } from '@/engineV2/models/raster'
import { View } from '@/engineV2/views'

import Renderer from './Renderer'

/**
 * An abstract class defining the contract for renderers which
 * expect a raster and a group of accompanying annotations
 * describing the properties of the raster.
 */
export default abstract class RasterTypeRenderer extends Renderer {
  abstract render (
    view: View,
    layer: ILayer,
    raster: Raster,
    annotations: Annotation[],
    inferred: boolean,
    filter?: ImageManipulationFilter | null,
    parent?: Annotation
  ): void;
}
