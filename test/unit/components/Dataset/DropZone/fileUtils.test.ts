import { v4 as uuidv4 } from 'uuid'

import { getFileCategory } from '@/components/Dataset/DropZone/fileUtils'

const createFile = (name?: string, type?: string) => new File([''], name || uuidv4(), { type })

describe('getFileCategory', () => {
  it('getFileCategory returns image when image file', () => {
    const imageFile = createFile('foo.png', 'image/png')
    expect(getFileCategory(imageFile)).toBe('image')
  })

  it('getFileCategory returns video when video file', () => {
    const videoFile = createFile('foo.mp4', 'video/mp4')
    expect(getFileCategory(videoFile)).toBe('video')
  })

  it('getFileCategory returns video when video file and no type', () => {
    const videoFile = createFile('foo.mkv')
    expect(getFileCategory(videoFile)).toBe('video')
  })

  it('getFileCategory returns dicom when dicom file', () => {
    const dicomFile = createFile('foo.dcm', 'file/dcm')
    expect(getFileCategory(dicomFile)).toBe('dicom')
  })

  it('getFileCategory returns dicom when rvg file', () => {
    const dicomFile = createFile('foo.rvg', 'file/rvg')
    expect(getFileCategory(dicomFile)).toBe('dicom')
  })

  it('getFileCategory returns pdf when pdf file', () => {
    const pdfFile = createFile('foo.pdf', 'application/pdf')
    expect(getFileCategory(pdfFile)).toBe('pdf')
  })
})
