import { VIEW_MODE } from '@/components/Common/Gallery/types'
import { AnnotationClassPayload, AnnotationTypePayload, LoadingStatus } from '@/store/types'
import { AnnotationClassesDetailsPayload } from '@/store/types/AnnotationClassesDetailsPayload'
import { AnnotationTypeName } from '@/store/types/AnnotationTypeName'
import { AttributePayload } from '@/store/types/AttributePayload'

export type AClassState = {
  attributes: AttributePayload[]
  classes: AnnotationClassPayload[]
  classesById: Record<number, AnnotationClassPayload>
  classesLoadingStatus: LoadingStatus
  classesTabSelectedTypeNames: AnnotationTypeName[]
  classesTabSortBy: 'id' | 'name'
  classesTabSortDirection: 'asc' | 'desc'
  classesTabViewMode: VIEW_MODE
  classSelected: { [k: number]: boolean }
  details: AnnotationClassesDetailsPayload
  search: string
  sortOrder: boolean
  types: AnnotationTypePayload[]
  typesLoadingStatus: LoadingStatus
}

export const getInitialState = (): AClassState => ({
  attributes: [],
  classes: [],
  classesById: {},
  classesLoadingStatus: LoadingStatus.Unloaded,
  classesTabSelectedTypeNames: [],
  classesTabSortBy: 'id',
  classesTabSortDirection: 'asc',
  classesTabViewMode: VIEW_MODE.CARD,
  /**
   * Holds selection status, per class id, to support selection on team and dataset
   * classes page
   */
  classSelected: {},
  details: { type_counts: [] },
  search: '',
  sortOrder: false,
  types: [],
  typesLoadingStatus: LoadingStatus.Unloaded
})

// initial state
export const state = getInitialState()
