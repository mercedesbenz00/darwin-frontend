export interface StorageMock {
  getItem: (key: string) => string | null
  setItem: (key: string, value: any) => void
  removeItem: (key: string) => void
}

export class Mock implements StorageMock {
  private store: { [s: string]: string } = {}
  getItem = (key: string) => this.store[key] || null
  setItem = (key: string, value: any) => {
    this.store[key] =
      value
        ? value.toISOString ? value.toISOString() : value.toString()
        : undefined
  }

  removeItem = (key: string) => delete this.store[key]
  clear = () => { this.store = {} }
}
