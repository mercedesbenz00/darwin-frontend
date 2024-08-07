import { BillingMutation } from '@/store/modules/billing/types'

export const HIDE_OUT_OF_STORAGE_DIALOG: BillingMutation<void> = (state) => {
  state.outOfStorageDialogShown = false
}
