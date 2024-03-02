export type SSOState = {
  config: string
}

export const getInitialState = (): SSOState => ({
  config: ''
})

// initial state
export const state: SSOState = getInitialState()
