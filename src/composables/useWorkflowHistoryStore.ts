import { cloneDeep } from 'lodash'
import { defineStore } from 'pinia'

import {
  V2WorkflowPayload
} from '@/store/types'

type State = {
  pointer: number,
  history: V2WorkflowPayload[]
}

/**
 * The store for managing workview history used for undo/redo.
 *
 * Keeps an `pointer` which is an index that is 0 based
 * and an `history` array each holding a unique V2WorkflowPayload
 * that could be assigned to the editableWorkflow
 */
const MAX_HISTORY_LENGTH = 100

export const useWorkflowHistoryStore = defineStore('workflowHistory', {
  state: (): State => ({
    pointer: 0,
    history: []
  }),
  getters: {
    /** Returns the currently active (open) thread */
    peak (state): V2WorkflowPayload | null {
      if (!state.history.length) { return null }
      return state.history[this.pointer] || null
    }
  },
  actions: {
    push (workflow: V2WorkflowPayload): void {
      if (this.history.length === 0) {
        this.history = [cloneDeep(workflow)]
        return
      }
      this.history = [
        ...this.history.slice(0, this.pointer + 1),
        // always put a clone of the workflow in the history,
        // so there is no direct reference updates bugs
        cloneDeep(workflow)
      ]
      this.pointer = this.history.length - 1
      // casual trimming to avoid memory growth
      if (this.history.length > MAX_HISTORY_LENGTH) {
        this.history = this.history.slice(-MAX_HISTORY_LENGTH + 10)
      }
    },
    undo () {
      if (!this.history.length) { return }
      this.pointer = Math.max(0, this.pointer - 1)
      return cloneDeep(this.history[this.pointer])
    },
    redo () {
      this.pointer = Math.min(this.history.length - 1, this.pointer + 1)
      return cloneDeep(this.history[this.pointer])
    }
  }
})
