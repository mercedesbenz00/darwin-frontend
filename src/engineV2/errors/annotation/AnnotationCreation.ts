export class AnnotationCreationError extends Error {
  constructor (message: string = "Can't create new annotation") {
    super(message)
    this.name = 'AnnotationCreation'
  }
}
