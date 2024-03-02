import { onMounted, onUnmounted, Ref } from 'vue'

/**
 * - key: the keyboard key code to listen to
 * - name: a string to help identifying the desired interaction
 * - condition: a Ref boolean that could be used to prevent triggering
 * the handler (eg: a component not being focused)
 * - handler: callback function
 * - special: used when a hotkey could be triggered from an input, therefore a special
 * keypress listener need to be added
 */
type HotkeyHandlerType = {
  key: string,
  name: string,
  condition?: Ref<boolean>,
  handler: () => any,
  special?: boolean
}

const bindings: Record<string, string> = {}
const keySpecificHandler = (params: HotkeyHandlerType): (evt: KeyboardEvent) => any =>
  (evt: KeyboardEvent): any => {
    const { condition, handler, key } = params
    if (evt.key === key) {
      if (condition && !condition.value) {
        evt.preventDefault()
        evt.stopPropagation()
        return false
      }
      handler()
    }
    return true
  }

/**
 * Attempt to provide a global hotkey hook.
 * The general idea is, only one handler per key can be mapped.
 * If more then one gets mapped, an error is thrown
 */
export const useHotkey = (params: HotkeyHandlerType): void => {
  const { condition, handler, key, name, special } = params
  if (bindings.key) {
    throw new Error(
      `Keybinding for ${key} already taken by '${bindings[key]}'. Now trying to use for '${name}'`
    )
  }

  bindings[key] = name
  const keyHandler = keySpecificHandler({ key, name, condition, handler })

  onMounted(() => {
    // keydown add support for all keys, but it's not triggered
    // when an interactive DOM input it's focused
    document.addEventListener('keydown', keyHandler, false)
    // special edge case for use as part of useHotkeysNavigation:
    // used when a hotkey could be triggered from a focused input, which
    // will capture the 'Enter' KeyobardEvent
    if (special && key === 'Enter') {
      document.addEventListener('keypress', keyHandler, false)
    }
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', keyHandler)
    if (special && key === 'Enter') {
      document.removeEventListener('keypress', keyHandler)
    }
  })
}
