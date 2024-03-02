import { GetterTree } from 'vuex'

import { AClassState } from '@/store/modules/aclass/state'
import { RootState } from '@/store/types'

import { annotationTypesForClass } from './annotationTypesForClass'
import { attributesByAnnotationClassId } from './attributesByAnnotationClassId'
import { filteredClasses } from './filteredClasses'
import { mainAnnotationTypeForClass } from './mainAnnotationTypeForClass'
import { mainAnnotationTypes } from './mainAnnotationTypes'
import { renderableAnnotationTypes } from './renderableAnnotationTypes'
import { renderableAnnotationTypesForClass } from './renderableAnnotationTypesForClass'
import { subAnnotationTypes } from './subAnnotationTypes'
import { subAnnotationTypesForClass } from './subAnnotationTypesForClass'

export const getters: GetterTree<AClassState, RootState> = {
  annotationTypesForClass,
  attributesByAnnotationClassId,
  filteredClasses,
  mainAnnotationTypeForClass,
  mainAnnotationTypes,
  renderableAnnotationTypes,
  renderableAnnotationTypesForClass,
  subAnnotationTypes,
  subAnnotationTypesForClass
}
