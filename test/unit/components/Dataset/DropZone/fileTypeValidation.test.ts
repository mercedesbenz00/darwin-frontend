import { v4 as uuidv4 } from 'uuid'

import { validateFileListTypes } from '@/components/Dataset/DropZone/fileTypeValidation'

const createFile = (type: string) => new File([''], uuidv4(), { type })

const ebook = createFile('application/vnd.amazon.ebook')
const pdf = createFile('application/pdf')
const png = createFile('image/png')
const jpeg = createFile('image/jpeg')
const video = createFile('video/mp4')
const svs = new File([''], 'test.svs', { type: '' })

describe('validateFileListTypes', () => {
  it('returns true if all files are of accepted type', () => {
    expect(
      validateFileListTypes([ebook, pdf], ['application/vnd.amazon.ebook', 'application/pdf'])
    ).toBe(true)

    expect(validateFileListTypes([png, video], ['image/png', 'video/mp4'])).toBe(true)
  })

  it('returns false if some files are not of accepted type', () => {
    expect(validateFileListTypes([png, video, pdf], ['image/png', 'video/mp4'])).toBe(false)
  })

  it('supports file type wildcards', () => {
    expect(validateFileListTypes([png, jpeg], ['image/*'])).toBe(true)
  })

  it('without type and not whitelisted', () => {
    expect(validateFileListTypes([png, jpeg, svs], ['image/*'])).toBe(false)
  })

  it('without type and whitelisted', () => {
    expect(validateFileListTypes([svs], ['.svs'])).toBe(true)
  })
})
