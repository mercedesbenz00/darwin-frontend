import { buildDatasetFolderPayload } from 'test/unit/factories'

import { folderHasChildren, getFolderName, normalizeFolderPath, treeify } from '@/utils'

describe('folderHasChildren', () => {
  it('returns false if null', () => {
    expect(folderHasChildren(null)).toBe(false)
  })

  it('returns false if children is undefined', () => {
    expect(folderHasChildren(buildDatasetFolderPayload({ children: undefined }))).toBe(false)
  })

  it('returns false if children has zero length', () => {
    expect(folderHasChildren(buildDatasetFolderPayload())).toBe(false)
  })

  it('returns true if has children', () => {
    expect(folderHasChildren(buildDatasetFolderPayload({
      children: [buildDatasetFolderPayload()]
    }))).toBe(true)
  })
})

describe('normalizeFolderPath', () => {
  it('returns "/test" if "/test"', () => {
    expect(normalizeFolderPath('/test')).toBe('/test')
  })
  it('returns "/test" if "test"', () => {
    expect(normalizeFolderPath('test')).toBe('/test')
  })
  it('returns "/test" if "///test/"', () => {
    expect(normalizeFolderPath('///test/')).toBe('/test')
  })
  it('returns "/root/test" if "/root///test/"', () => {
    expect(normalizeFolderPath('/root///test/')).toBe('/root/test')
  })
})

describe('treeify', () => {
  it('returns tree structure when empty array', () => {
    expect(treeify([], 1)).toEqual([buildDatasetFolderPayload({ path: '/', dataset_id: 1 })])
  })
  it('returns tree structure when parent folder was in an array', () => {
    const folders = [
      buildDatasetFolderPayload({ path: '/' }),
      buildDatasetFolderPayload({ path: '/test1' }),
      buildDatasetFolderPayload({ path: '/test2' })
    ]
    expect(treeify(folders, 1)).toEqual([
      buildDatasetFolderPayload({
        path: '/',
        children: [folders[1], folders[2]]
      })
    ])
  })
  it('returns tree structure when parent folder was not in an array', () => {
    const folders = [
      buildDatasetFolderPayload({ path: '/' }),
      buildDatasetFolderPayload({ path: '/test1' }),
      buildDatasetFolderPayload({ path: '/test2/child' })
    ]
    expect(treeify(folders, 1)).toEqual([
      buildDatasetFolderPayload({
        path: '/',
        children: [
          folders[1],
          buildDatasetFolderPayload({
            path: '/test2',
            children: [folders[2]]
          })
        ]
      })
    ])
  })
})

describe('getFolderName', () => {
  it('returns folder name', () => {
    expect(getFolderName('/')).toEqual('/')
    expect(getFolderName('/root')).toEqual('root')
    expect(getFolderName('/root/folder')).toEqual('folder')
  })
})
