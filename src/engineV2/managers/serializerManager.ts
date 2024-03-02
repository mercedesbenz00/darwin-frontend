import { AnnotationData, Raster } from '@/engineV2/models'

export interface AnnotationTypeSerializer<T = AnnotationData> {
  serialize(data: T): any;
  deserialize(rawData: any): T | null;
  /**
   * When a new annotation is created, `defaultData()` is called for each valid annotations for that
   * annotation class. If return value is not null, that sub annotation is then added. This saves us
   * for keeping track if there are any mandatory sub annotations and saves one round trip to the
   * backend.
   *
   * @param data optional payload that can be passed via the editor.createAnnotation
   */
  defaultData?(data: any): AnnotationData | null
}

export interface RasterTypeSerializer<T = AnnotationData> {
  serialize(data: T, raster: Raster, annotationId: string): any;
  deserialize(rawData: any, raster: Raster, annotationId: string): T | null;
  // TODO -> I don't think we'll need this, we'll see
  // defaultData?(data: any): AnnotationData | null
}

export type Serializer<T = AnnotationData> = AnnotationTypeSerializer<T> | RasterTypeSerializer<T>

export class SerializerManager {
  private serializers = new Map<string, Serializer>();

  registerSerializer (name: string, serializer: Serializer): void {
    if (this.serializers.has(name)) {
      console.info(`WARNING, Serializer '${name}' already exists`)
      return
    }
    this.serializers.set(name, serializer)
  }

  unregisterSerializer (name: string): void {
    if (!this.serializers.has(name)) {
      console.info(`WARNING, Trying to unregister uknown serializer '${name}'`)
      return
    }
    this.serializers.delete(name)
  }

  getSerializer<T = AnnotationData> (name: string): 
    AnnotationTypeSerializer<T> | RasterTypeSerializer<T> | undefined {
    return this.serializers.get(name) as
      Serializer<T> | undefined
  }
}
