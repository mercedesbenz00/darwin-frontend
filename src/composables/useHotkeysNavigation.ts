import { Ref } from 'vue'

import { useHotkey } from '@/composables'

// Grouped arrowkeys by callback called
const ARROWKEYS = {
  INCREASE: ['ArrowDown'],
  DECREASE: ['ArrowUp'],
  SUBMIT: ['Enter'],
  CLOSE: ['Escape', 'Tab']
}

export type HotkeyNavigationParams = {
  condition: Ref<boolean>,
  handlers: {
    increase?: () => void,
    decrease?: () => void,
    submit?: () => void,
    close?: () => void,
  },
  name: string,
  special?: boolean
}

export type ShouldScrollParams = {
  idx: number,
  next: boolean,
  length: number,
  firstIdx: number,
  lastIdx: number,
  visibleItems: number
}

/**
 * Calculate the idx to scroll.
 * it's not visible and therefore the list should be scroleld
 * @param idx, index of the current item
 * @param next, if the user pressed 'ArrowDown' | 'ArrowRight'
 * @param visibleItems, number of currently visible items
 * @returns {boolean}
 */
export const newScrollIdx = (params: ShouldScrollParams): number => {
  const { idx, next, visibleItems } = params
  if (next) { return idx }
  return Math.max(idx - visibleItems + 1, 0)
}

/**
 * Returns if, after using an arrowkey, the next/prev item
 * it's not visible and therefore the list should be scrolled
 * @param idx, index of the current item
 * @param next, if the user pressed 'ArrowDown' | 'ArrowRight'
 * @param length, total length of the list
 * @param firstIdx, first index currently visible
 * @param lastIdx, last index currently visible
 * @returns {boolean}
 */
export const shouldScroll = (params: ShouldScrollParams): number => {
  const { idx, next, length, firstIdx, lastIdx } = params
  if (next) {
    const reachedLastVisibleItem = idx >= lastIdx
    const reachedLastListItem = idx === 0
    return reachedLastVisibleItem || reachedLastListItem ? newScrollIdx(params) : -1
  } else {
    const reachedFirstVisibleItem = idx <= firstIdx
    const reachedFirstItem = idx === length - 1
    return reachedFirstVisibleItem || reachedFirstItem ? newScrollIdx(params) : -1
  }
}

/**
 * Allow the user navigatin a list using arrowkeys
 * eg:
 *  useHotkeysNavigation({
 *    name: 'name of the list',
 *    handlers: {
 *      increase: () => { // MOVE TO NEXT ITEM },
 *      decrease: () => { // MOVE TO PREVIOUS ITEM },
 *      submit: () => { // SELECT ACTIVE ITEM },
 *      close: () => { // CLOSE THE LIST (is possible) }
 *    }
 *  })
 * @param name, the name of the list (used by useHotkey composable)
 * @param handlers, object colelcting all possible callbacks called by this composable
 */
export const useHotkeysNavigation = (params: HotkeyNavigationParams): void => {
  if (!params) { return }
  const {
    condition,
    handlers: {
      increase,
      decrease,
      submit,
      close
    },
    name,
    special
  } = params
  if (increase) {
    ARROWKEYS.INCREASE.forEach((key: string) => {
      const _name = `${name} - Increase selected item`
      useHotkey({ key, condition, handler: increase, name: _name, special })
    })
  }
  if (decrease) {
    ARROWKEYS.DECREASE.forEach((key: string) => {
      const _name = `${name} - Decrease selected item`
      useHotkey({ key, condition, handler: decrease, name: _name, special })
    })
  }
  if (submit) {
    ARROWKEYS.SUBMIT.forEach((key: string) => {
      const _name = `${name} - Submit selected item`
      useHotkey({ key, condition, handler: submit, name: _name, special })
    })
  }
  if (close) {
    ARROWKEYS.CLOSE.forEach((key: string) => {
      const _name = `${name} - Close`
      useHotkey({ key, condition, handler: close, name: _name, special })
    })
  }
}
