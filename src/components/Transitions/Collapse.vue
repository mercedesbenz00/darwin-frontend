<template>
  <transition
    :name="name"
    @before-appear="beforeAppear"
    @appear="appear"
    @after-appear="afterAppear"
    @appear-cancelled="appearCancelled"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @enter-cancelled="enterCancelled"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
    @leave-cancelled="leaveCancelled"
  >
    <slot />
  </transition>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'

type RelevantDimensions = Partial<{
  [key in keyof CSSStyleDeclaration]: string
}>

/**
 * @CollapseTransition
 * This custom VueJS transition component wraps the built-in transition.
 * It collapses elements horizontally or vertically. Works with both fixed and
 * 'auto' width or height.
 *
 * Wrap the container you wish to make collapsable with the <collapse> tag.
 * When you toggle the v-show or v-if boolean value, the transition will automatically trigger.
 *
 * @param {string} name
 * By default, the transition name is collapse.
 * The classes would be like collapse-enter and collapse-leave-to.
 * @param {string} dimension - Set the dimension attribute to height or width.
 * @param {number} duration - How long should the transition take in milliseconds.
 * @param {string} easing - The CSS transition-timing-function (easing) to use.
 * */

@Component({ name: 'collapse' })
export default class Collapse extends Vue {
  cachedStyles: RelevantDimensions | null = null

  @Prop({ type: String, required: false, default: 'collapse' })
  name!: string

  @Prop({
    type: String,
    required: false,
    default: 'height',
    validator: (value: string): boolean => {
      return ['height', 'width'].includes(value)
    }
  })
  dimension!: string

  @Prop({ type: Number, required: false, default: 300 })
  duration!: number

  @Prop({ type: String, required: false, default: 'ease-in-out' })
  easing!: string

  @Watch('dimension')
  onDimension (): void {
    this.clearCachedDimensions()
  }

  get transition (): string {
    if (!this.cachedStyles) { return '' }
    const transitions: string[] = []

    Object.keys(this.cachedStyles).forEach((key) => {
      transitions.push(`${this.convertToCssProperty(key)} ${this.duration}ms ${this.easing}`)
    })

    return transitions.join(', ')
  }

  beforeAppear (el: HTMLDivElement): void {
    this.$emit('before-appear', el)
  }

  appear (el: HTMLDivElement): void {
    this.$emit('appear', el)
  }

  afterAppear (el: HTMLDivElement): void {
    this.$emit('after-appear', el)
  }

  appearCancelled (el: HTMLDivElement): void {
    this.$emit('appear-cancelled', el)
  }

  beforeEnter (el: HTMLDivElement): void {
    this.$emit('before-enter', el)
  }

  enter (el: HTMLDivElement, done: () => void): void {
    /* Detecting and caching dimensions, because width/height could be 'auto' */
    this.detectAndCacheDimensions(el)

    this.setClosedDimensions(el)
    this.hideOverflow(el)
    this.forceRepaint(el)
    this.setTransition(el)
    this.setOpenedDimensions(el)

    this.$emit('enter', el, done)

    setTimeout(done, this.duration)
  }

  afterEnter (el: HTMLDivElement): void {
    // Clean up inline styles
    this.unsetOverflow(el)
    this.unsetTransition(el)
    this.unsetDimensions(el)
    this.clearCachedDimensions()

    this.$emit('after-enter', el)
  }

  enterCancelled (el: HTMLDivElement): void {
    this.$emit('enter-cancelled', el)
  }

  beforeLeave (el: HTMLDivElement): void {
    this.$emit('before-leave', el)
  }

  leave (el: HTMLDivElement, done: () => void): void {
    this.detectAndCacheDimensions(el)
    this.setOpenedDimensions(el)
    this.hideOverflow(el)
    this.forceRepaint(el)
    this.setTransition(el)
    this.setClosedDimensions(el)

    this.$emit('leave', el, done)
    setTimeout(done, this.duration)
  }

  afterLeave (el: HTMLDivElement): void {
    this.unsetOverflow(el)
    this.unsetTransition(el)
    this.unsetDimensions(el)
    this.clearCachedDimensions()

    this.$emit('after-leave', el)
  }

  leaveCancelled (el: HTMLDivElement): void {
    this.$emit('leave-cancelled', el)
  }

  detectAndCacheDimensions (el: HTMLDivElement): void {
    if (this.cachedStyles) {
      return
    }

    const visibility = el.style.visibility
    const display = el.style.display

    el.style.visibility = 'hidden'
    el.style.display = ''

    this.cachedStyles = this.detectRelevantDimensions(el)

    el.style.visibility = visibility
    el.style.display = display
  }

  clearCachedDimensions (): void {
    this.cachedStyles = null
  }

  detectRelevantDimensions (el: HTMLDivElement): RelevantDimensions {
    if (this.dimension === 'height') {
      return {
        height: el.offsetHeight + 'px',
        paddingTop: el.style.paddingTop || this.getCssValue(el, 'padding-top'),
        paddingBottom: el.style.paddingBottom || this.getCssValue(el, 'padding-bottom')
      }
    }

    if (this.dimension === 'width') {
      return {
        width: `${el.offsetWidth}px`,
        paddingLeft: el.style.paddingLeft || this.getCssValue(el, 'padding-left'),
        paddingRight: el.style.paddingRight || this.getCssValue(el, 'padding-right')
      }
    }

    return {}
  }

  setTransition (el: HTMLDivElement): void {
    el.style.transition = this.transition
  }

  unsetTransition (el: HTMLDivElement): void {
    el.style.transition = ''
  }

  hideOverflow (el: HTMLDivElement): void {
    el.style.overflow = 'hidden'
  }

  unsetOverflow (el: HTMLDivElement): void {
    el.style.overflow = ''
  }

  setClosedDimensions (el: HTMLDivElement): void {
    if (!this.cachedStyles) { return }

    Object.keys(this.cachedStyles).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const index = key as keyof Omit<CSSStyleDeclaration, any>

      el.style[index] = '0'
    })
  }

  setOpenedDimensions (el: HTMLDivElement): void {
    if (!this.cachedStyles) { return }

    Object.keys(this.cachedStyles).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const index = key as keyof Omit<CSSStyleDeclaration, any>

      el.style[index] = this.cachedStyles![index] as string
    })
  }

  unsetDimensions (el: HTMLDivElement): void {
    if (!this.cachedStyles) { return }

    Object.keys(this.cachedStyles).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const index = key as keyof Omit<CSSStyleDeclaration, any>

      el.style[index] = ''
    })
  }

  forceRepaint (el: HTMLDivElement): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getComputedStyle(el)[this.dimension as any]
  }

  getCssValue (el: HTMLDivElement, style: string): string {
    return getComputedStyle(el, null).getPropertyValue(style)
  }

  convertToCssProperty (style: string): string {
    const upperChars = style.match(/([A-Z])/g)

    if (!upperChars) { return style }

    for (let i = 0, n = upperChars.length; i < n; i++) {
      style = style.replace(new RegExp(upperChars[i]), '-' + upperChars[i].toLowerCase())
    }

    if (style.slice(0, 1) === '-') {
      style = style.slice(1)
    }

    return style
  }
}
</script>
