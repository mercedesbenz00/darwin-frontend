export interface CallbackHandle {
  id: number;

  /** Invalidates the callback */
  release(): void;
}

export enum CallbackStatus {
  Continue,
  Stop
}

/**
 * CallbackhandleCollection creates and stores CallbackHandles
 * handles calls to all of them and removal of no longer needed callbacks
 * If a callback returns CallbackStatus.Stop, the more callbacks are processed.
 * If CallbackStatus.Continue or void is return, the calls continue
 */

export class CallbackHandleCollection<U extends any[]> {
  private maxId: number = 0;
  private collection: {cb: ((...args: U) => void | CallbackStatus), id: number}[] = [];

  /**
   * Calls every callback added to the collection in FIFO order.
   * If any callback returns `CallbackStatus.Stop`, no further callbacks are called.
   * @param args all arguments needed by the callbacks
   */
  public call (...args: U) {
    for (const entry of this.collection) {
      if (entry) {
        const callbackStatus = entry.cb(...args)
        if (callbackStatus === CallbackStatus.Stop) {
          return
        }
      }
    }
  }

  /**
   * Adds a new callback to the collection, note that collections are ordered, FIFO.
   * @param callback callback to add to the collection
   */
  public add (callback: (...args: U) => void): CallbackHandle {
    const entry = { cb: callback, id: this.maxId }
    this.maxId += 1
    this.collection.push(entry)

    return (function (id: number, collection: CallbackHandleCollection<U>) {
      return {
        id: id,
        release () {
          collection.remove(id)
        }
      }
    }(entry.id, this))
  }

  /**
   * This function is primarily used in CallbackHandle.release()
   * to remove a callback from the collection.
   * @param id id for the callback to remove
   */
  public remove (id: number): void {
    const index = this.collection.findIndex(entry => entry.id === id)
    if (index !== -1) {
      this.collection.splice(index, 1)
    }
  }

  public clear (): void {
    this.collection = []
  }
}
