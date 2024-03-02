import { onMounted, onUnmounted } from 'vue'

/**
 * - name: a string to help identifying the desired interaction
 * - handler: callback function
 */
 type ComboHotkeysType = {
  name?: string,
  key?: string,
  ctrlKey?: boolean,
  shiftKey?: boolean,
  handler: () => any,
}

const comboHotkeysHandler = (params: ComboHotkeysType): (evt: KeyboardEvent) => any =>
  (evt: KeyboardEvent): boolean => {
    const { key, ctrlKey, shiftKey, handler } = params
    if (evt.key === key && (!ctrlKey || evt.ctrlKey) && (!shiftKey || evt.shiftKey)) {
      evt.stopPropagation()
      handler()
      return false
    }
    return true
  }

/**
 * Listen for Key+ key combination
 * TODO: this composable could be merged with useHotkey
 * https://linear.app/v7labs/issue/SWAT-206/merge-usehotkey-and-usecombohotkeys
 */
export const useComboHotkeys = (params: ComboHotkeysType): void => {
  const keyHandler = comboHotkeysHandler(params)

  onMounted(() => {
    document.addEventListener('keydown', keyHandler)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', keyHandler)
  })
}
