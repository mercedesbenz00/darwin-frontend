import { ActionTree } from 'vuex'

import { AClassState } from '@/store/modules/aclass/state'
import { RootState } from '@/store/types'

import { addToDataset } from './addToDataset'
import { createAnnotationClass } from './createAnnotationClass'
import { createClassImageUploadInfo } from './createClassImageUploadInfo'
import { createOrFetchAnnotationAttribute } from './createOrFetchAnnotationAttribute'
import { deleteAnnotationAttribute } from './deleteAnnotationAttribute'
import { deleteClasses } from './deleteClasses'
import { loadAnnotationTypes } from './loadAnnotationTypes'
import { loadClassAnnotationAttributes } from './loadClassAnnotationAttributes'
import { loadClassUsage } from './loadClassUsage'
import { loadDatasetAnnotationAttributes } from './loadDatasetAnnotationAttributes'
import { loadTeamAnnotationClasses } from './loadTeamAnnotationClasses'
import { removeFromDataset } from './removeFromDataset'
import { setClassSelections } from './setClassSelections'
import { unloadAll } from './unloadAll'
import { updateAnnotationAttribute } from './updateAnnotationAttribute'
import { updateAnnotationClass } from './updateAnnotationClass'

export const actions: ActionTree<AClassState, RootState> = {
  addToDataset,
  createAnnotationClass,
  createClassImageUploadInfo,
  createOrFetchAnnotationAttribute,
  deleteAnnotationAttribute,
  deleteClasses,
  loadAnnotationTypes,
  loadClassAnnotationAttributes,
  loadClassUsage,
  loadDatasetAnnotationAttributes,
  loadTeamAnnotationClasses,
  removeFromDataset,
  setClassSelections,
  unloadAll,
  updateAnnotationAttribute,
  updateAnnotationClass
}
