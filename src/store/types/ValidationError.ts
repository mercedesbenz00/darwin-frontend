export type ValidationNestedError = {
  [s: string]: ValidationError | string | string[] | [string]
}

export type ValidationError = {
  [s: string]:
    | ValidationNestedError[]
    | string
    | string[]
    | ValidationError
}
