export type AnnotationActorRole = 'annotator' | 'reviewer'

export type AnnotationActorPayload = {
  role: AnnotationActorRole
  /* eslint-disable camelcase */
  user_id: number
  /* eslint-enable camelcase */
}
