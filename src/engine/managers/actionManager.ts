import EventEmitter from 'events'
export interface Action {
  id?: string;
  do(): Promise<boolean> | boolean;
  undo(): Promise<boolean> | boolean;
}

export interface ActionGroup {
  do(action: Action): void;
  canUndo: boolean;
  remove(): void;
}

export class ActionManager extends EventEmitter {
  private doneActions: Action[] = [];
  private undoneActions: Action[] = [];

  /**
   * Performs an action which can later be undone (and then redone)
   * @param action The action to be performed and pushed into the history stack
   * @returns Success status of this action, if failed, no need to push into the history stack
   */
  async do (action: Action): Promise<void> {
    const success = await action.do()
    if (!success) { return }
    this.doneActions.push(action)
    this.undoneActions = []
    this.emit('action')
  }

  /**
   * Adds an action to the history without executing it.
   * @param action The action to be stored
   */
  done (action: Action) {
    this.doneActions.push(action)
    this.undoneActions = []
  }

  /**
   * Undoes the latest performed action
   * No op if there are no actions to be undone.
   * @returns Success status of this undo action, if failed, no need to push into the history stack
   */
  async undo () {
    const lastAction = this.doneActions.pop()
    if (lastAction) {
      const success = await lastAction.undo()
      if (!success) { return }
      this.undoneActions.push(lastAction)
    }
    this.emit('action')
  }

  /**
   * Redoes a previously [[undo]]ed action
   */
  async redo () {
    const lastAction = this.undoneActions.pop()
    if (lastAction) {
      await lastAction.do()
      this.doneActions.push(lastAction)
    }
    this.emit('action')
  }

  /**
   * Empties lists of done actions and undone actions
   */
  clear () {
    this.doneActions = []
    this.undoneActions = []
  }

  get canUndo (): boolean {
    return this.doneActions.length > 0
  }

  get canRedo (): boolean {
    return this.undoneActions.length > 0
  }

  /**
   * Creates an [[ActionGroup]], useful when one or more actions are only undoable for
   * a short duration, e.g. adding each point in a Polygon. When the group is no
   * longer needed: call [[remove]] to remove all its actions from the actionManager.
   */
  createGroup (): ActionGroup {
    const id = Math.random().toString(36).substr(2, 9)
    const manager = this

    return {
      async do (action: Action) {
        await manager.do({ ...action, id })
      },
      remove () {
        manager.remove(id)
      },
      get canUndo () {
        return manager.doneActions.findIndex(action => action.id === id) > -1
      }
    }
  }

  private remove (id: string) {
    this.doneActions = this.doneActions.filter(action => !action.id || action.id !== id)
    this.undoneActions = this.undoneActions.filter(action => !action.id || action.id !== id)
  }
}
