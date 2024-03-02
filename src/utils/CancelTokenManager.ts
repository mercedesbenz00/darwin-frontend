import axios, { CancelToken, CancelTokenSource } from 'axios'

import { AdditionalRequestOptions } from './api'

export class CancelTokenManager {
  static cancelToken: { [key: string]: CancelTokenSource | undefined } = {}

  /**
   * check if there are pending requests for this ID
   * and in case cancel them to avoid racing conditions, and clear
   * the cancel token.
   * So only the last one will trigger changes in the UI
   */
  static registerCancelToken (id: string): CancelToken | undefined {
    if (this.cancelToken[id]) {
      const message = `Cancelled due to new request on annotation with id ${id}.`
      this.cancelToken[id]?.cancel(message)
    }

    // create and keep new axios cancel token for this annotation ID
    this.cancelToken[id] = axios.CancelToken.source()

    return this.cancelToken[id]?.token
  }

  /**
   * When the api call ends successfully release the cancelToken for this ID
   */
  static unregisterCancelToken (id: string): void {
    if (this.cancelToken[id]) { delete this.cancelToken[id] }
  }
}

export const withCancelToken = <T>(
  fn: (options: AdditionalRequestOptions) => Promise<T>
) => (key: string, options: AdditionalRequestOptions = {}): Promise<T> => {
    options.cancelToken = CancelTokenManager.registerCancelToken(key)
    return fn(options).then((res) => {
      CancelTokenManager.unregisterCancelToken(key)
      return res
    })
  }
