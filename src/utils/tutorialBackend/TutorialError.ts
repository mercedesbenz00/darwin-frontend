export default class TutorialError extends Error {
  constructor (message: string) {
    super(`Tutorial: ${message}`)
  }
}
