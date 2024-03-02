import { StoragePayload } from '@/store/types/StoragePayload'

export type StorageState = {
  storages: { [key: string]: StoragePayload }
}

export const getInitialState = (): StorageState => ({
  storages: {}
})

const state: StorageState = getInitialState()

export default state
