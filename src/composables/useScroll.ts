type UseScrollType = {
  isScrollable: (ref: HTMLElement | null | Vue) => boolean,
  scrollRefToBottom: (ref: HTMLElement | null | Vue, callback?: () => {}) => void
}

export const useScroll = (): UseScrollType => {
  const isScrollable = (ref: HTMLElement | null | Vue): boolean => {
    if (ref) {
      const el = '$el' in ref ? ref.$el as HTMLElement : ref
      const { scrollWidth, scrollHeight, clientWidth, clientHeight } = el
      const hasHorizontalScrollbar = scrollWidth > clientWidth
      const hasVerticalScrollbar = scrollHeight > clientHeight
      return hasHorizontalScrollbar || hasVerticalScrollbar
    }
    return false
  }

  const scrollRefToBottom = (ref: HTMLElement | null | Vue, callback?: () => {}): void => {
    if (ref && isScrollable(ref)) {
      const el = '$el' in ref ? ref.$el as HTMLElement : ref
      const { offsetHeight: height } = el
      el.scrollTo({ top: height + 8, behavior: 'smooth' })
      if (callback) { callback() }
    } else if (isScrollable(ref)) {
      console.warn('useScroll: element it\'s not scrollable')
    } else {
      console.warn('useScroll: element is undefined')
    }
  }

  return {
    isScrollable,
    scrollRefToBottom
  }
}
