import { ERROR_MESSAGES } from '@/errors'
import store from '@/store'

export const errorToast = (content: string = ERROR_MESSAGES.DEFAULT_ERROR_MESSAGE): void => {
  store.dispatch('toast/warning', { content })
}
