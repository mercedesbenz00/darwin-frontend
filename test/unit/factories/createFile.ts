import { v4 as uuidv4 } from 'uuid'

export const createFile = (name?: string, type?: string): File =>
  new File([''], name || uuidv4(), { type: type || 'image/png' })
