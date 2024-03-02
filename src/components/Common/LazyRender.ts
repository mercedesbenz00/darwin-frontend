import { VNode } from 'vue'
import { Component, Vue } from 'vue-property-decorator'
import { CreateElement } from 'vue/types/umd'

const isIntersecting = (entries: IntersectionObserverEntry[]): boolean => {
  const entry = entries[0]
  // some browsers (edge 15) do not support isIntersecting
  // need to cast to any when checking, or typescript will
  // decide the entry is of type `never`
  return ('isIntersecting' in entry)
    ? entry.isIntersecting
    : entry.intersectionRatio > 0
}

/**
 * Utility component used to delay rendering of a slotted component until it scrolls into view.
 *
 * The `IntersectionObserver` API is used to achieve this.
 *
 * This functionality is intended to be used when mounting a component,
 * even off-screen, is resource intensive, due to, for example, data computation.
 *
 * This will not significantly help with scenarios where performance issue is directly related to
 * a large number of elements being rendered, unless the html of those elements
 * is extremely complex.
 */
@Component({ name: 'lazy-render' })
export default class LazyRender extends Vue {
  scrolledIntoView: boolean = false

  mounted (): void {
    // We immediately load the component if  `IntersectionObserver` is not supported.
    if (!('IntersectionObserver' in window)) {
      this.scrolledIntoView = true
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (!isIntersecting(entries)) { return }

      // Cleanup the observer when it's not needed anymore.
      observer.unobserve(this.$el)
      this.scrolledIntoView = true
    })

    // We observe the root `$el` of the
    // mounted loading component to detect
    // when it becomes visible.
    observer.observe(this.$el)

    this.$on(
      'hook:beforeDestroy',
      // for components which haven't been lazily rendered yet,
      // this.$el will be `<!-->`
      () => this.$el instanceof Element && observer.unobserve(this.$el)
    )
  }

  render (createElement: CreateElement): VNode | VNode[] | undefined {
    const { scrolledIntoView } = this
    return scrolledIntoView
      ? this.$slots.default
      : createElement('div')
  }
}
