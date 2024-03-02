import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { AnnotationTypeName } from '@/store/types'

export default class ClassDialog {
  public showClassSelection: boolean = false;
  public annotationType: AnnotationTypeName | null = null
  public previousClassID: number | null = null;
  private resolveCallback?: ((value: AnnotationClass | null) => void) | null
  private rejectCallback?: (() => void) | null

  public requestUserSelectClass (
    annotationType: AnnotationTypeName,
    previousClassID: number | null = null
  ): Promise<AnnotationClass | null> {
    this.previousClassID = previousClassID
    this.annotationType = annotationType
    this.showClassSelection = true

    this.rejectCallback && this.rejectCallback()

    return new Promise((resolve, reject) => {
      this.resolveCallback = resolve
      this.rejectCallback = reject
    })
  }

  public selectAnnotationClass (annotationClass: AnnotationClass): void {
    if (this.previousClassID === annotationClass.id) {
      this.cancel()
      return
    }
    this.resolveCallback && this.resolveCallback(annotationClass)
    this.reset()
  }

  public cancel (): void {
    this.resolveCallback && this.resolveCallback(null)
    this.reset()
  }

  reset (): void {
    this.previousClassID = null
    this.showClassSelection = false
    this.rejectCallback = null
    this.resolveCallback = null
  }
}
