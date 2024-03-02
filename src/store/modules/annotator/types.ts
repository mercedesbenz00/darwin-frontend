import { AnnotatorState } from '@/store/modules/annotator'
import { TypedAction, RootState } from '@/store/types'

export type AnnotatorAction<T, R = any> = TypedAction<AnnotatorState, RootState, T, R>
