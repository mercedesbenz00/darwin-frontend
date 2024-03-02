import { DatasetItemCountsPayload } from './DatasetItemCountsPayload'

/**
 * This is a structure we construct locally from a `DatasetItemConunts` payload
 * and an id.
 *
 * It is never returned in this raw from from the backend.
 */
export type DatasetDetailPayload = DatasetItemCountsPayload & { id: number}
