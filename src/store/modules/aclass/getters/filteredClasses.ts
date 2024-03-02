import { Getter } from 'vuex'

import { AClassState } from '@/store/modules/aclass/state'
import { AnnotationClassPayload, AnnotationTypePayload, RootState } from '@/store/types'
import { AnnotationTypeName } from '@/store/types/AnnotationTypeName'

const applySearch = (classes: AnnotationClassPayload[], search: string) => {
  if (search === '') { return classes }
  return classes.filter(c => c.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
}

const applySelectedTypeIds = (
  classes: AnnotationClassPayload[],
  types: AnnotationTypePayload[],
  selectedTypes: AnnotationTypeName[]
) => {
  if (selectedTypes.length === 0) { return classes }
  return classes.filter(
    cl => cl.annotation_types.some(typeName => selectedTypes.includes(typeName))
  )
}

const applyOrder = (
  classes: AnnotationClassPayload[],
  sortBy: keyof AnnotationClassPayload,
  sortDirection: 'asc' | 'desc'
): AnnotationClassPayload[] => {
  const order = sortDirection === 'asc' ? 1 : -1

  const compareFn = (class1: AnnotationClassPayload, class2: AnnotationClassPayload) => {
    if (class1[sortBy] < class2[sortBy]) { return 1 * order }
    if (class1[sortBy] > class2[sortBy]) { return -1 * order }
    return 0
  }

  return classes.sort(compareFn)
}

export const filteredClasses: Getter<AClassState, RootState> =
  (state): AnnotationClassPayload[] => {
    let results = [...state.classes]
    results = applySearch(results, state.search)
    results = applySelectedTypeIds(results, state.types, state.classesTabSelectedTypeNames)
    results = applyOrder(results, state.classesTabSortBy, state.classesTabSortDirection)
    return results
  }
