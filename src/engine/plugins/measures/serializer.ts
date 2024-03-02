import { PluginContext } from '@/engine/editor'
import { AnnotationTypeSerializer } from '@/engine/managers'
import { AnnotationData } from '@/engine/models'
import { isDefaultMeasureRegion } from '@/engine/utils'

export interface MeasuresSerializer extends AnnotationTypeSerializer {
  context?: PluginContext
}

export const serializer: MeasuresSerializer = {
  serialize (): any {
    if (!this.context) { return }
    const { editor } = this.context
    const { measureRegion } = editor
    if (!measureRegion) { return }
    if (isDefaultMeasureRegion(measureRegion)) { return }

    return {
      measures: {
        unit: measureRegion.unit,
        delta: measureRegion.delta
      }
    }
  },

  deserialize (rawData: any): AnnotationData | null {
    if (!this.context) { return null }
    const { editor } = this.context
    const { measureRegion } = editor
    if (!measureRegion) { return null }
    if (!rawData.measures) { return null }

    return {
      unit: rawData.measures.unit,
      delta: rawData.measures.delta
    }
  },

  defaultData (): AnnotationData | null {
    if (!this.context) { return null }
    const { editor } = this.context
    const { measureRegion } = editor
    if (!measureRegion) { return null }
    if (isDefaultMeasureRegion(measureRegion)) { return null }
    return {
      unit: measureRegion.unit,
      delta: measureRegion.delta
    }
  }
}
