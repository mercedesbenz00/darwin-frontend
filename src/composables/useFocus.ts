import { onMounted, onUnmounted, ref, Ref } from 'vue'

type UseFocusType = {
  /**
   * Hold if the item is currently focused
   */
   focused: Ref<Boolean>,
  /**
   * Check if the focus has changed
   */
   onFocusChange: (evt: FocusEvent) => void
}

type UseSetFocusType = {
  /**
   * manually focus/blur a DOM element based on its ref
   * optionally passing click: true also click the element,
   * as it's useful in some cases
   */
   setFocus: (ref: HTMLElement | null, value: boolean, click?: boolean) => void
}

/**
 * Provide a check on the document to detect if the DOM element
 * targetted by class name it's currently being focused
 */
export const useFocus = (
  targetClassName: string,
  handler: (value: boolean) => void
): UseFocusType => {
  const focused: Ref<Boolean> = ref(false)

  const onFocusChange = (evt: FocusEvent): void => {
    const path = evt.composedPath()
    try {
      const oldVal = focused.value
      const newVal = (path as HTMLDivElement[]).some(({ className }) =>
        className === targetClassName)
      focused.value = newVal
      if (newVal !== oldVal) { handler(newVal) }
    } catch (err: unknown) {
      focused.value = false
    }
  }

  onMounted(() => {
    if (targetClassName === '') {
      const message = [
        'Passing an empty target className will result in the composable',
        'tracking for focus change on the whole document'
      ].join(' ')
      console.warn(`useFocus: ${message}`)
    }
    document.addEventListener('click', onFocusChange)
  })

  onUnmounted(() => {
    document.removeEventListener('click', onFocusChange)
  })

  return {
    focused,
    onFocusChange
  }
}

/**
 * Provide a way to easily focus/blur an element by its ref
 */
export const useSetFocus = (): UseSetFocusType => {
  const setFocus = (
    ref: HTMLElement | null | Vue,
    value: boolean,
    performClick: boolean = false
  ): void => {
    try {
      if (ref) {
        const el = '$el' in ref ? ref.$el as HTMLElement : ref
        if (value) {
          if ('focus' in el) { el.focus() }
          if (performClick && 'click' in el) { el.click() }
        } else {
          if ('blur' in el) { el.blur() }
        }
      } else {
        console.warn('useSetFocus, specified ref is undefined')
      }
    } catch (err: unknown) {
      console.warn(`useSetFocus, ${err}`)
    }
  }

  return {
    setFocus
  }
}
