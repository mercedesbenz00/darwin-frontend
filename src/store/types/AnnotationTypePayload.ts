import { AnnotationTypeName } from '@/store/types/AnnotationTypeName'

type DataSkeleton = { [k: string]: string | DataSkeleton }

export type AnnotationTypePayload = {
  /* eslint-disable camelcase */
  data_skeleton: DataSkeleton
  description: string
  granularity: 'main' | 'sub';
  id: number;
  metadata_skeleton: DataSkeleton
  name: AnnotationTypeName
  subs: AnnotationTypePayload[];
  visible: boolean;
  /* eslint-enable camelcase */
}
