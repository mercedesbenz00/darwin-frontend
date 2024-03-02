import { DirectiveOptions } from 'vue'
import { DirectiveBinding, DirectiveFunction } from 'vue/types/options'

type MouseEventHandler = (event: MouseEvent) => void
type KeydownEventHanlder = (event: KeyboardEvent) => void

export type BoundElement = HTMLElement &
  {
    __inputAutoBlurHandler__?: {
      mouseHandler: MouseEventHandler
      keydownHandler: KeydownEventHanlder
    }
  }

const validate = (binding: DirectiveBinding) => {
  if (typeof binding.value !== 'boolean') {
    throw new Error('vue-input-auto-blur: Binding value must be a boolean.')
  }
}

const addHandler = (el: BoundElement) => {
  if (el.__inputAutoBlurHandler__) { return }

  // Define Handler and cache it on the element
  const mouseHandler = (event: MouseEvent) => {
    if (el === event.target) { return }
    el.blur()
  }

  const keydownHandler = (event: KeyboardEvent) => {
    if (el !== event.target) { return }
    if (!['Enter', 'Escape'].includes(event.key)) { return }
    el.blur()
  }

  el.__inputAutoBlurHandler__ = { mouseHandler, keydownHandler }
  document.addEventListener('click', mouseHandler)
  el.addEventListener('keydown', keydownHandler)
}

const removeHandler = (el: BoundElement) => {
  if (!el.__inputAutoBlurHandler__) { return }
  document.removeEventListener('click', el.__inputAutoBlurHandler__.mouseHandler)
  el.removeEventListener('keydown', el.__inputAutoBlurHandler__.keydownHandler)
  delete el.__inputAutoBlurHandler__
}

/**
 * Directive used to blur input
 *  when the user clicks outside the specified element
 *  or the user presses `Enter` or `Esc` key
 *
 * Use as
 *
 * ```
 * <input v-input-auto-blur="booleanValue" />
 * ```
 */
const directive: DirectiveOptions & {
  bind: DirectiveFunction,
  update: DirectiveFunction,
  unbind: DirectiveFunction
} = {
  bind: function (el, binding) {
    validate(binding)

    if (binding.value) {
      addHandler(el as BoundElement)
    }
  },

  update: function (el, binding) {
    validate(binding)
    if (binding.value) {
      addHandler(el as BoundElement)
    } else {
      removeHandler(el as BoundElement)
    }
  },

  unbind: function (el) {
    removeHandler(el as BoundElement)
  }
}

export default directive
