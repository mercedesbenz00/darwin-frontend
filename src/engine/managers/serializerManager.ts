import { AnnotationData } from '@/engine/models'

export interface AnnotationTypeSerializer<T = AnnotationData> {
  serialize(data: T): any;
  deserialize(rawData: any): T | null;
  /**
   * When a new annotation is created, `defaultData()` is called for each valid
   * sub annotations for that annotation class.
   *
   * If return value is not null, that sub annotation is then added.
   *
   * This saves us for keeping track if there are any mandatory sub annotations
   * and saves one round trip to the backend.
   *
   * @param data optional payload that can be passed via the editor.createAnnotation
   */
  defaultData?(data: any): AnnotationData | null
}

export class SerializerManager {
  private serializers = new Map<string, AnnotationTypeSerializer>();

  registerSerializer (name: string, serializer: AnnotationTypeSerializer) {
    if (this.serializers.has(name)) {
      console.info(`WARNING, Serializer '${name}' already exists`)
      return
    }
    this.serializers.set(name, serializer)
  }

  unregisterSerializer (name: string) {
    if (!this.serializers.has(name)) {
      console.info(`WARNING, Trying to unregister uknown serializer '${name}'`)
      return
    }
    this.serializers.delete(name)
  }

  getSerializer<T = AnnotationData> (name: string): AnnotationTypeSerializer<T> | undefined {
    return this.serializers.get(name) as AnnotationTypeSerializer<T> | undefined
  }
}
