import { Ref } from 'vue'

import { useEventListener } from '@/composables/useEventListener'

// source https://logaretm.com/blog/my-favorite-5-vuejs-composables/
interface HotkeyOptions {
  // target element can be a reactive ref
  target: Ref<EventTarget> | EventTarget;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  // use ctrl or cmd key - suitable for cmd-z and ctrl-z, cmd-c and ctrl-c etc.
  mainKey: boolean;
  exact: boolean;
}

export const matchesKeyScheme = (
  opts: Pick<Partial<HotkeyOptions>,
    'shiftKey' | 'ctrlKey' | 'exact' | 'mainKey' | 'metaKey' | 'altKey'

  > & { platform: string },
  evt: KeyboardEvent
): boolean => {
  const ctrlKey = opts.ctrlKey ?? false
  const shiftKey = opts.shiftKey ?? false
  const mainKey = opts.mainKey ?? false
  const meta = opts.metaKey ?? false
  const altKey = opts.altKey ?? false
  const isMac = opts.platform.toLowerCase().includes('mac')
  if (opts.exact) {
    const nonMainKeysMatch = evt.shiftKey === shiftKey && evt.altKey === altKey
    return mainKey
      ? (isMac
        ? evt.metaKey === true && evt.ctrlKey === false && nonMainKeysMatch
        : evt.metaKey === false && evt.ctrlKey === true && nonMainKeysMatch)
      : (ctrlKey === evt.ctrlKey && meta === evt.metaKey && nonMainKeysMatch)
  }
  const satisfiedKeys: boolean[] = []
  satisfiedKeys.push(evt.ctrlKey === (opts.ctrlKey ?? evt.ctrlKey))
  satisfiedKeys.push(evt.shiftKey === (opts.shiftKey ?? evt.shiftKey))
  satisfiedKeys.push(evt.metaKey === (opts.metaKey ?? evt.metaKey))
  satisfiedKeys.push(evt.altKey === (opts.altKey ?? evt.altKey))
  satisfiedKeys.push(opts.mainKey
    ? (isMac
      ? evt.metaKey === true
      : evt.ctrlKey === true)
    : true)
  return satisfiedKeys.every((key) => key)
}

export const useHotkeyCombo = (
  key: string,
  onKeyPressed: () => void,
  opts: Partial<HotkeyOptions> = {}
): void => {
  // get the target element
  const target = opts?.target || window
  useEventListener(target, 'keydown', (e) => {
    const options = { platform: navigator.platform, ...opts }
    if ((e as KeyboardEvent).key.toLowerCase() === key.toLowerCase() &&
        matchesKeyScheme(options, e as KeyboardEvent)) {
      e.preventDefault()
      onKeyPressed()
    }
  })
}
