import { ModelDevice, NeuralModelAction } from '@/store/modules/neuralModel/types'
import { AnnotationClassPayload, AnnotationTypePayload } from '@/store/types'
import { ValidationError } from '@/store/types/ValidationError'
import { ParsedValidationError } from '@/utils'
import { WindErrorCodes } from '@/utils/error/errors'
import { trainModel as windTrainModel } from '@/utils/wind'
import { TrainingClass, TrainingSessionPayload } from '@/utils/wind/types'

const annotationClassToTrainingClass = (
  annotationClass: AnnotationClassPayload,
  mainType: AnnotationTypePayload,
  subTypes: AnnotationTypePayload[]
): Omit<TrainingClass, 'id'> => {
  const { id, name } = annotationClass
  const type = mainType.name
  const subs = subTypes.map(t => t.name)

  return { darwin_id: id, name, type, subs }
}

type TrainModel = NeuralModelAction<void, TrainingSessionPayload>

export const trainModel: TrainModel = async ({ commit, rootState, state, rootGetters }) => {
  const { newModelValidationErrors: errors } = state

  if (Object.keys(errors).length > 0) {
    const error: ParsedValidationError = {
      errors: errors as ValidationError,
      isValidationError: true,
      message: 'Data is invalid'
    }

    return { error }
  }

  const {
    newModelAnnotationClasses,
    newModelDataset,
    newModelName,
    newModelSelectedClassIds,
    newModelTemplate
  } = state

  if (!newModelDataset || !newModelTemplate) {
    throw new Error('Invalid action outcome. Template and dataset should be set')
  }

  const team = rootState.team.currentTeam

  const {
    id: datasetId,
    slug: datasetSlug,
    team_id: teamId,
    version: datasetVersion
  } = newModelDataset

  if (!team || team.id !== newModelDataset.team_id) {
    throw new Error(
      '[neuralModel/trainModel]: Training model for dataset which is not part of current team'
    )
  }

  const classes = newModelAnnotationClasses
    .filter(c => newModelSelectedClassIds.includes(c.id))
    .map(c => {
      const mainType: AnnotationTypePayload = rootGetters['aclass/mainAnnotationTypeForClass'](c)
      const subTypes: AnnotationTypePayload[] = rootGetters['aclass/subAnnotationTypesForClass'](c)
      return annotationClassToTrainingClass(c, mainType, subTypes)
    })

  const params = {
    datasetId,
    datasetSlug,
    datasetVersion,
    device: ModelDevice.GPU,
    classes,
    modelTemplateId: newModelTemplate.id,
    name: newModelName,
    teamId,
    teamSlug: team.slug
  }

  const response = await windTrainModel(params)
  if (
    'error' in response &&
    'isValidationError' in response.error &&
    response.error.isValidationError
  ) {
    commit('SET_NEW_MODEL_VALIDATION_ERRORS_FROM_BACKEND', response.error)
  }

  if ('error' in response && response.error.code === WindErrorCodes.NO_PAYMENT_METHOD) {
    const message = 'You need to provide a valid payment method in order to train models'
    return { error: { ...response.error, message } }
  }

  if (
    'error' in response &&
    response.error.code === WindErrorCodes.PARTNER_DOES_NOT_COVER_NEURAL_NETWORKS
  ) {
    const { partner } = rootState.team.currentTeam || {}
    const message =
      [
        (
          partner
            ? `Your partner, ${partner.name} does not cover neural network costs.`
            : 'Your partner does not cover your neural network costs.'
        ),
        'You will have to discuss and change your relationship with them to start training models.'
      ].join(' ')

    return { error: { ...response.error, message } }
  }

  if ('data' in response) {
    commit('PUSH_TRAINING_SESSION', response.data)
  }

  return response
}
