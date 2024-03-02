import { AnnotationTypeName, AnnotationTypePayload } from '@/store/types'

export class AnnotationType {
  readonly name: AnnotationTypeName;
  readonly subs: AnnotationType[];
  readonly id: number;
  readonly granularity: string;

  constructor (payload: AnnotationTypePayload) {
    this.name = payload.name
    this.id = payload.id
    this.granularity = payload.granularity
    this.subs = payload.subs.map(sub => new AnnotationType(sub))
  }
}
