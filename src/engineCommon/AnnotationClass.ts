import { AnnotationTypeName, AnnotationClassPayload, AnnotationClassMetadata } from '@/store/types'
import { RGBA, parseRGBA, rgbaString, getRGBAColorHash } from '@/utils'

/**
 * An annotation class as used by the editor
 */
export class AnnotationClass {
  /* eslint-disable camelcase */
  /** Annotation class id, unique on a team level */
  readonly id: number;
  /** name of the annotation class, only unique at a dataset level */
  readonly name: string;

  /**
   * Datasets this class is associated to
   */
  readonly datasets: AnnotationClassPayload['datasets']

  /**
   * Any data that is specific to the AnnotationType(s) used by the annotation
   * class, mainly _color
   */
  readonly metadata: AnnotationClassMetadata
  /**
   * Describes which annotation types are implemented by this annotation class
   * (e.g. bounding_box, label, direction_vector)
   */
  readonly annotation_types: AnnotationTypeName[];

  /** Description of how the class should be annotated, can be long */
  readonly description: string;

  /** Image URL to a thumbnail representing the class */
  readonly imageURL: string | null;

  readonly color: RGBA;

  readonly insertedAt: Date;

  /* eslint-enable camelcase */

  constructor (payload: AnnotationClassPayload) {
    this.id = payload.id
    this.name = payload.name
    this.datasets = payload.datasets
    this.description = payload.description
    this.metadata = payload.metadata
    this.imageURL = payload.images[0]?.crop_url || null
    this.annotation_types = payload.annotation_types
    this.color = this.metadata._color
      ? parseRGBA(this.metadata._color)
      : getRGBAColorHash(this.name)
    this.insertedAt = new Date(payload.inserted_at)
  }

  /** Prettified version of the class name, use when showing the end user */
  get displayName (): string {
    return this.name
  }

  get colorRGBAstring (): string {
    return rgbaString(this.color)
  }
}
