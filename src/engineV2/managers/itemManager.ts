import EventEmitter from 'events'

// NOTE: we import from submodule so we can stub only this function in tests
import debounce from 'lodash/debounce'

import { V2DatasetItemPayload } from '@/store/types'

/**
 * @event item:changed
 */
export class ItemManager extends EventEmitter {
  /**
   * @event item:changed
   * @property {V2DatasetItemPayload} currentItem - Returns current item on change.
   */
  private _currentItem: V2DatasetItemPayload | null = null

  public get currentItem (): V2DatasetItemPayload | null {
    return this._currentItem
  }

  // Debounce to support hotkey press & hold to jump throw dataset items
  private emitFileChange = debounce(() => {
    this.emit('item:changed', this.currentItem)
  }, 500)

  setCurrentItem (item: V2DatasetItemPayload | null): void {
    this._currentItem = item
    this.emitFileChange()
  }
}
