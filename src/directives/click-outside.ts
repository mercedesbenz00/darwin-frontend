import { DirectiveOptions } from 'vue'
import { DirectiveBinding } from 'vue/types/options'

type MouseEventHandler = (event: MouseEvent) => void

type BoundElement = HTMLElement &
  { __clickOutsideHandler__?: { callback: Function, handler: MouseEventHandler } }

const validate = (binding: DirectiveBinding) => {
  if (typeof binding.value !== 'function') {
    throw new Error(
      `[Vue-click-outside:] provided expression ${binding.expression}is not a function.`
    )
  }
}

const addHandler =
  (el: BoundElement, binding: DirectiveBinding, handler: MouseEventHandler) => {
    el.__clickOutsideHandler__ = {
      handler: handler,
      callback: binding.value
    }

    document.addEventListener('click', handler)
  }

const execute = (el: BoundElement, event: MouseEvent) => {
  if (!el.__clickOutsideHandler__) { return }
  el.__clickOutsideHandler__.callback(event)
}

const removeHandler = (el: BoundElement) => {
  if (!el.__clickOutsideHandler__) { return }
  document.removeEventListener('click', el.__clickOutsideHandler__.handler)
  delete el.__clickOutsideHandler__
}

/**
 * Directive used to call a handler when the user clicks outside the specified element
 *
 * Use as
 *
 * ```
 * <my-component v-click-outside="functionName" />
 * ```
 *
 * Note
 *
 * Common usage for this directive is to dismiss a menu or a modal which has been opened
 * by another element.
 *
 * Due to the way how binding a directive works, the click that triggers the
 * open will trigger the handler as well.
 *
 * To prevent this, rather than `@click`, `@click.stop` must be used on the trigger.
 *
 * For example
 *
 * ```
 * <button class="my-modal-trigger" @click.stop="showModal = true" />
 * <my-modal v-if="showModal" v-click-outside="showModal = false" />
 * ```
 */
const directive: DirectiveOptions = {
  bind: function (el, binding, vNode) {
    validate(binding)

    // Define Handler and cache it on the element
    const handler = (event: MouseEvent) => {
      if (!vNode.context) { return }

      if (!event.target) { return }
      if (el.contains(event.target as Node)) { return }

      execute(el as BoundElement, event)
    }

    addHandler(el as BoundElement, binding, handler)
  },

  update: function (el, binding) {
    validate(binding)
    const boundElement = (el as BoundElement)
    if (!boundElement.__clickOutsideHandler__) { return }
    boundElement.__clickOutsideHandler__.callback = binding.value
  },

  unbind: function (el) {
    removeHandler(el as BoundElement)
  }
}

export default directive
