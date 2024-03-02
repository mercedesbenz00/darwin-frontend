import { onMacOS } from '@/utils'

/**
 * Specify a keybinding for an action
 * @example
 ```ts
  {keys: ["ctrl", "z"] action: "undo" }
 ```
 */
export interface Keybinding {
  keys: string[]
  action: string | string[]
  when?: string
  eventType?: 'keydown' | 'keyup'
}

const xor = (a: boolean, b: boolean): boolean => (a && !b) || (!a && b)

/**
 * Check if keyboard event matches modifiers for the hotkey defintion,
 * assuming the system is MacOS
 *
 * On MacOS, Ctrl and Meta modifiers are treated as different keys
 * */
const checkMacOSModifier = (event: KeyboardEvent, keys: string[]): boolean => (
  !xor(keys.includes('alt'), event.altKey) &&
  !xor(keys.includes('shift'), event.shiftKey) &&
  !xor(keys.includes('ctrl'), event.ctrlKey) &&
  !xor(keys.includes('meta'), event.metaKey)
)

/**
 * Check if keyboard event matches modifiers for the hotkey defintion,
 * assuming the system is not MacOS
 *
 * On non-MacOS systems, Ctrl and Meta modifiers are treated as the same key
 * */
const checkGeneralModifier = (event: KeyboardEvent, keys: string[]): boolean => (
  // on MacOS, treat Ctrl and Meta as different keys
  !xor(keys.includes('alt'), event.altKey) &&
  !xor(keys.includes('shift'), event.shiftKey) &&
  !xor(keys.includes('ctrl') || keys.includes('meta'), event.ctrlKey)
)

const checkModifier = (event: KeyboardEvent, keys: string[]): boolean =>
  onMacOS() ? checkMacOSModifier(event, keys) : checkGeneralModifier(event, keys)

const MODIFIERS = ['alt', 'ctrl', 'meta', 'shift']

const removeModifiers = (keys: string[]): string[] =>
  keys.filter(k => !MODIFIERS.includes(k.toLocaleLowerCase()))

/**
 * Returns true if all the `keys` match against the event from the keyboard
 * @param event Event from the keyboard
 * @param keys keys to match against
 */
export const keybindingMatch = (event: KeyboardEvent, keys: string[]): boolean => (
  checkModifier(event, keys) &&
  removeModifiers(keys).every(k => {
    const lowerKey = k.toLocaleLowerCase()
    return lowerKey === event.key.toLocaleLowerCase() ||
      lowerKey === String.fromCharCode(event.keyCode).toLocaleLowerCase()
  })
)
