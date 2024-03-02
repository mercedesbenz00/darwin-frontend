import { DirectiveBinding } from 'vue/types/options'

const setAttribute = (el: HTMLElement, binding: DirectiveBinding) => {
  if (
    binding.value === null ||
    binding.value === undefined ||
    typeof binding.value === 'string'
  ) {
    el.setAttribute(binding.name, `${binding.value}`)
    return
  }

  // everything except functions is rendered as stringified value
  // in the case of function, we render `bound ${functionName}`
  const stringified = JSON.stringify(binding.value)
  const mockValue = stringified
    ? stringified.replace(/"/g, "'")
    : typeof binding.value === 'function'
      ? binding.value.name
      : null

  // this means directive needs to be modified to support new value type
  if (mockValue === null) { throw new Error('Unsupported value type') }

  el.setAttribute(binding.name, mockValue)
}

/**
 * A generic directive stub which makes it so the directive sets an attribute on the element
 *
 * - the name of the attribute is the name of the directive, sans `v-`
 * - the value is the stringified value of the directive.
 *
 * This is useful for snapshot tests on simpler 3rd (or even 1st) party directives,
 * where we just want the snapshot to make sure the directive data is correct.
 *
 * A good example is the tooltip directive.
 *
 * NOTE: It is not recommended to use this with v-click-outside as that
 * directive can easily be used incorrectly.
 *
 * Instead, click-outside behavior should be directly tested using the
 * `attachToDocument` mounting option
 */
export const stubDirectiveWithAttribute: Vue.DirectiveOptions = {
  bind (el, binding) { setAttribute(el, binding) },
  update (el, binding) { setAttribute(el, binding) }
}
