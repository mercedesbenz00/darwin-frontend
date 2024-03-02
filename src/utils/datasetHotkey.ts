import { AnnotationHotkeysPayload, DatasetPayload } from '@/store/types'

/**
 * Return enhanced hotkeys list from defined hotkeys list for dataset and annotation classes
 */
export const getDatasetHotkeys = (params: {
  annotationClasses: ({ id: number })[],
  dataset: DatasetPayload
}): AnnotationHotkeysPayload => {
  const { annotationClasses, dataset } = params
  if (!dataset) { return {} }

  const { annotation_hotkeys: definedHotkeys } = dataset
  const datasetHotkeys: AnnotationHotkeysPayload = { ...definedHotkeys }
  const supportedHotkeys: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  supportedHotkeys.forEach((hotkey) => {
    if (definedHotkeys[hotkey]) { return }

    const aclassWithoutHotkey = annotationClasses
      .find(aclass => !Object.values(datasetHotkeys).includes(`select_class:${aclass.id}`))
    if (!aclassWithoutHotkey) { return }

    datasetHotkeys[hotkey] = `select_class:${aclassWithoutHotkey.id}`
  })

  return datasetHotkeys
}

export const getAnnotationClassHotkey = (
  datasetHotkeys: AnnotationHotkeysPayload,
  classId: number
): string | null => {
  const matchingHotkey = Object.keys(datasetHotkeys)
    .find(hotkey => datasetHotkeys[hotkey] === `select_class:${classId}`)
  return matchingHotkey || null
}
