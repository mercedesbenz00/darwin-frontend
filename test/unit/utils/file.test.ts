import { enableFetchMocks } from 'jest-fetch-mock'

import {
  formatFileSize,
  getFileFromUrl
} from '@/utils/file'

describe('formatFileSize', () => {
  it('returns 500 B if 500', () => {
    expect(formatFileSize(500)).toEqual('500 B')
  })

  it('returns 1KB if 1024', () => {
    expect(formatFileSize(1024)).toEqual('1 kB')
  })

  it('returns 1.5KB if 1536', () => {
    expect(formatFileSize(1536)).toEqual('1.5 kB')
  })

  it('returns 1MB of 1048576', () => {
    expect(formatFileSize(1048576)).toEqual('1 MB')
  })

  it('returns 1GB of 1073741824', () => {
    expect(formatFileSize(1073741824)).toEqual('1.1 GB')
  })
})

describe('getFileFromUrl', () => {
  beforeEach(() => {
    enableFetchMocks()
  })

  it('returns File object from file url', async () => {
    fetchMock.mockResponseOnce('FileMock')
    const file = await getFileFromUrl('1.png', 'https://v7labs.com/logo.png')
    expect(file.name).toEqual('1.png')
  })
})
