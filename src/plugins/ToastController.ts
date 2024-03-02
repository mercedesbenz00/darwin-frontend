import throttle from 'lodash/throttle'
import _Vue, { PluginObject } from 'vue'

import ExtendedToast from '@/components/Common/Toast/V2/ExtendedToast.vue'
import MinimalToast from '@/components/Common/Toast/V2/MinimalToast.vue'
import { ToastEvent, ToastProps } from '@/components/Common/Toast/V2/types'

/**
 * ToastController V2
 * Mainly used for notifications.
 *
 * Implemented as plugin. Can be used by calling one of the 4 typed functions.
 *
 * Example:
 * this.$toast.error(...MountProps)
 * this.$toast.warning(...MountProps)
 * this.$toast.info(...MountProps)
 * this.$toast.success(...MountProps)
 * */

export type ToastLocation = 'bottom-right' | 'bottom-left' | 'top-left' | 'top-right' | 'center'
export type MountProps = {
  extended?: boolean // uses ExtendedToast.vue instead of MinimalToast.vue
  duration?: number
  location?: ToastLocation
} & Omit<ToastProps, 'variant'>

class ToastController extends _Vue {
  toastContainerNode: HTMLDivElement
  mountedToasts: { tId?: unknown; el: HTMLDivElement }[]
  spacing: number
  containerPadding: number
  transitionTime: number

  constructor () {
    super()
    this.toastContainerNode = this.createScene()
    this.spacing = 4
    this.containerPadding = 12
    this.transitionTime = 225 /* in ms */
    this.mountedToasts = []

    document.body.appendChild(this.toastContainerNode)
  }

  createScene (): HTMLDivElement {
    const scene = document.createElement('div')
    scene.classList.add('toast-scene__container')
    return scene
  }

  error (args: MountProps): void {
    this.mountToast({
      variant: ToastEvent.ERROR,
      location: 'center',
      ...args
    })
  }

  warning (args: MountProps): void {
    this.mountToast({
      variant: ToastEvent.WARNING,
      location: 'center',
      ...args
    })
  }

  success (args: MountProps): void {
    this.mountToast({
      variant: ToastEvent.SUCCESS,
      location: 'center',
      ...args
    })
  }

  info (args: MountProps): void {
    this.mountToast({
      variant: ToastEvent.DEFAULT,
      location: 'center',
      ...args
    })
  }

  dismiss (el: HTMLDivElement): void {
    const entryIndex = this.mountedToasts.findIndex((toast) => toast.el === el)
    if (entryIndex !== -1) {
      const entry = this.mountedToasts[entryIndex]
      clearTimeout(entry.tId as number)
      entry.el.style.opacity = '0'
      setTimeout(() => {
        entry.el.remove()
        this.mountedToasts.splice(entryIndex, 1)
        this.refreshAnimation()
      }, this.transitionTime)
    }
  }

  mountToast = throttle((args: MountProps & { variant: ToastEvent }): void => {
    const mountNode = document.createElement('div')
    this.toastContainerNode.appendChild(mountNode)

    const _C = _Vue.extend(args.extended ? ExtendedToast : MinimalToast)
    new _C({ propsData: args }).$mount(mountNode)

    this.mountedToasts.push({
      tId: undefined,
      el: document.querySelector('.toast__container:last-of-type') as HTMLDivElement
    })

    this.animateToasts(args.duration, args.location)
  }, 150)

  animateToasts (duration?: MountProps['duration'], location?: MountProps['location']): void {
    const elements: NodeListOf<HTMLDivElement> = this.toastContainerNode.querySelectorAll(
      '.toast__container'
    )
    Array.from(elements)
      .reverse()
      .forEach((t, i) => {
        const { height } = t.getBoundingClientRect()
        if (location?.includes('top')) {
          t.style.transform = `translateY(${(height + this.spacing) * (i + 1)}px)`
          t.style.top = `${-height + this.containerPadding}px`
          if (location?.includes('left')) {
            t.style.left = `${this.containerPadding}px`
          } else {
            t.style.right = `${this.containerPadding}px`
          }
        } else if (location?.includes('center')) {
          t.style.transform = `translateY(-${(height + this.spacing) * (i + 1)}px)`
          t.style.bottom = `${-height + (this.containerPadding + 108)}px`
          t.classList.add('toast-pos-center')
        } else {
          t.style.transform = `translateY(-${(height + this.spacing) * (i + 1)}px)`
          t.style.bottom = `${-height + this.containerPadding}px`
          if (location?.includes('left')) {
            t.style.left = `${this.containerPadding}px`
          } else {
            t.style.right = `${this.containerPadding}px`
          }
        }
        t.style.opacity = '1'

        this.unmountInTime(t, i, duration)
      })
  }

  refreshAnimation (): void {
    const elements: NodeListOf<HTMLDivElement> = this.toastContainerNode.querySelectorAll(
      '.toast__container'
    )
    Array.from(elements)
      .reverse().forEach((t, i) => {
        const { height } = t.getBoundingClientRect()
        t.style.transform = `translateY(${-(height + this.spacing) * (i + 1)}px)`
      })
  }

  unmountInTime (el: HTMLDivElement, index: number, duration?: number): void {
    const tId = setTimeout(() => {
      el.style.opacity = '0'
      setTimeout(() => {
        el.remove()
        this.mountedToasts.splice(index, 1)
      }, this.transitionTime)
    }, duration || 3000) as unknown

    const toastIndex = this.mountedToasts.findIndex(t => t.el === el)
    if (toastIndex !== -1) {
      this.mountedToasts[toastIndex] = { ...this.mountedToasts[toastIndex], tId }
    }
  }
}

const Toast: PluginObject<{}> = {
  install: (Vue: typeof _Vue) => {
    Vue.prototype.$toast = new ToastController()
  }
}

export default Toast

export declare class ToastType {
  static install(Vue: typeof _Vue): void

  error: (args: MountProps) => void
  warning: (args: MountProps) => void
  success: (args: MountProps) => void
  info: (args: MountProps) => void
  dismiss: () => void
}

declare module 'vue/types/vue' {
  interface Vue {
    $toast: ToastType
  }
}
