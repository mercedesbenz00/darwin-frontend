import { DirectiveFunction, DirectiveOptions } from 'vue/types/options'

/**
 * Directive to show loading spinner on above any div element
 * Usage
 * <div v-loading="loadingFlag" :loading-options="{
 *    label: 'Loading...', // Label to show below the loading spinner
 *    size: 'medium', // large, medium, small
 *    theme: 'grey', // grey, dark
 *    delay: '1s', // Delay before the spinner appears - DEFAULT: 0
 *    backgroundColor: 'rgb(255, 255, 255)' // background Color of the overlay
 *    minTimeout: 1000 // Minimum timeout to show the spinner - DEFAULT: 200
 * ">
 * </div>
 */
const MIN_TIMEOUT = 200

const getSpinner = (element: HTMLElement) => element.querySelector(':scope > .v-loading')

type SpinnerOptions = {
  delay?: string
  minTimeout?: number
  backgroundColor: string
  size: 'large' | 'medium' | 'small'
  theme: 'grey' | 'dark'
  label: string
}

const options = (userOptions: Partial<SpinnerOptions> = {}): SpinnerOptions => ({
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  size: 'medium', // large, medium, small
  theme: 'grey', // grey, dark
  label: 'Loading...',
  ...userOptions
})

const addSpinner = (el: HTMLElement, options: SpinnerOptions) => {
  const box = document.createElement('div')
  box.className = `v-loading v-loading--${options.size} v-loading--${options.theme}`
  box.style.backgroundColor = options.backgroundColor

  if (options.delay) {
    box.style.transitionDelay = options.delay
  }

  const spinnerHtml = `
    <div class="mul5">
      <div class="mul5circle1"></div>
      <div class="mul5circle2"></div>
      <div class="mul5circle3"></div>
    </div>
  `

  if (options.label) {
    box.innerHTML = `
      ${spinnerHtml}
      <label>${options.label}</label>
    `
    box.className = `${box.className} v-loading--with-label`
  } else {
    box.innerHTML = spinnerHtml
  }

  el.dataset.minTimeout = (options.minTimeout || MIN_TIMEOUT).toString()
  el.dataset.remove = 'false'
  el.dataset.timeout = 'false'

  el.appendChild(box)
}

const hideSpinner = (el: HTMLElement) => {
  const box = getSpinner(el)
  if (el.dataset.timeout === 'true' && el.dataset.remove === 'true') {
    if (box) { box.classList.remove('v-loading--active') }
    el.dataset.timeout = 'false'
    el.dataset.remove = 'false'
  }
}

const showSpinner = (el: HTMLElement, show: boolean) => {
  const style = window.getComputedStyle(el)
  const position = style.getPropertyValue('position')
  if (position === 'static' || position === '') {
    el.dataset.static = 'true'
    el.style.position = 'relative'
  }

  if (show) {
    const box = getSpinner(el)
    const timeout = el.dataset.minTimeout ? parseInt(el.dataset.minTimeout) : MIN_TIMEOUT
    if (box) { box.classList.add('v-loading--active') }
    el.dataset.remove = 'false'
    el.dataset.timeout = 'false'

    setTimeout(() => {
      el.dataset.timeout = 'true'
      hideSpinner(el)
    }, timeout)
  } else {
    el.dataset.remove = 'true'
    hideSpinner(el)
  }
}

const removeSpinner = (el: HTMLElement) => {
  const box = getSpinner(el)
  if (box) { box.remove() }
  if (el.dataset.static) { el.style.removeProperty('position') }
}

const bind: DirectiveFunction = (el, binding, vnode) => {
  if (vnode.data && vnode.data.attrs) {
    addSpinner(el, options(vnode.data.attrs['loading-options']))
  } else {
    addSpinner(el, options())
  }
  showSpinner(el, binding.value)
}

const unbind: DirectiveFunction = (el) => removeSpinner(el)

const update: DirectiveFunction = (el, binding, vnode, oldVnode) => {
  const newOpt = vnode.data?.attrs
    ? vnode.data.attrs['loading-options']
    : {}
  const oldOpt = oldVnode.data?.attrs
    ? oldVnode.data.attrs['loading-options']
    : {}
  if (JSON.stringify(newOpt) !== JSON.stringify(oldOpt)) {
    unbind(el, binding, vnode, oldVnode)
    bind(el, binding, vnode, oldVnode)
  } else {
    showSpinner(el, binding.value)
  }
}

const directive: DirectiveOptions = {
  bind, update, unbind
}

export default directive
