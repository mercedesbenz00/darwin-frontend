import {
  buildDatasetFolderPayload,
  buildDatasetItemFilenamePayload,
  buildDatasetPayload,
  buildMembershipPayload
} from 'test/unit/factories'

import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'
import {
  filenameToOption,
  filenameStringToFilenamePayload,
  folderToOption,
  membershipToOption
} from '@/components/DatasetFiltering/GenericFilter/utils'
import { DatasetItemType } from '@/store/types'

describe('membershipToOption', () => {
  it('returns option object for membership option', () => {
    const membership = buildMembershipPayload({
      id: 1,
      first_name: 'Test',
      last_name: 'Annotator1'
    })
    const option: GenericFilterOptionType = {
      id: 'annotator-1',
      label: 'Test Annotator1',
      type: 'assignees',
      includeHeader: false,
      data: membership
    }
    expect(membershipToOption(membership)).toEqual(option)
  })
})

describe('filenameToOption', () => {
  it('returns option object for filename option', () => {
    const filename = buildDatasetItemFilenamePayload({ filename: '1.jpg' })
    const option: GenericFilterOptionType = {
      id: 'filename-1.jpg',
      label: '1.jpg',
      type: 'filenames',
      includeHeader: false,
      data: filename
    }
    expect(filenameToOption(filename)).toEqual(option)
  })
})

describe('folderToOption', () => {
  it('returns option object for folder option', () => {
    const folder = buildDatasetFolderPayload({ path: '/test' })
    const dataset = buildDatasetPayload({ name: 'Test Dataset' })
    const option: GenericFilterOptionType = {
      id: 'folder-/test',
      label: '/test',
      type: 'paths',
      includeHeader: false,
      data: folder
    }
    expect(folderToOption(folder, dataset)).toEqual(option)
  })

  it('returns dataset name for root folder option', () => {
    const folder = buildDatasetFolderPayload({ path: '/' })
    const dataset = buildDatasetPayload({ name: 'Test Dataset' })
    const option: GenericFilterOptionType = {
      id: 'folder-/',
      label: 'Test Dataset',
      type: 'paths',
      includeHeader: false,
      data: folder
    }
    expect(folderToOption(folder, dataset)).toEqual(option)
  })
})

describe('filenameStringToFilenamePayload', () => {
  it('returns image type if filename has image file extensions', () => {
    expect(filenameStringToFilenamePayload('1.jpg')).toEqual({
      filename: '1.jpg',
      type: DatasetItemType.image,
      isDicom: false,
      isPdf: false
    })
    expect(filenameStringToFilenamePayload('1.png')).toEqual({
      filename: '1.png',
      type: DatasetItemType.image,
      isDicom: false,
      isPdf: false
    })
    expect(filenameStringToFilenamePayload('1.tiff')).toEqual({
      filename: '1.tiff',
      type: DatasetItemType.image,
      isDicom: false,
      isPdf: false
    })
  })

  it('returns dicom type if filename has dicom file extensions', () => {
    expect(filenameStringToFilenamePayload('1.dcm')).toEqual({
      filename: '1.dcm',
      type: DatasetItemType.playbackVideo,
      isDicom: true,
      isPdf: false
    })
    expect(filenameStringToFilenamePayload('1.DCM')).toEqual({
      filename: '1.DCM',
      type: DatasetItemType.playbackVideo,
      isDicom: true,
      isPdf: false
    })
  })

  it('returns pdf type if filename has pdf file extensions', () => {
    expect(filenameStringToFilenamePayload('1.pdf')).toEqual({
      filename: '1.pdf',
      type: DatasetItemType.playbackVideo,
      isDicom: false,
      isPdf: true
    })
    expect(filenameStringToFilenamePayload('1.PDF')).toEqual({
      filename: '1.PDF',
      type: DatasetItemType.playbackVideo,
      isDicom: false,
      isPdf: true
    })
  })

  it('returns video type if filename has video file extensions', () => {
    expect(filenameStringToFilenamePayload('1.mpg')).toEqual({
      filename: '1.mpg',
      type: DatasetItemType.playbackVideo,
      isDicom: false,
      isPdf: false
    })
    expect(filenameStringToFilenamePayload('1.avi')).toEqual({
      filename: '1.avi',
      type: DatasetItemType.playbackVideo,
      isDicom: false,
      isPdf: false
    })
    expect(filenameStringToFilenamePayload('1.mov')).toEqual({
      filename: '1.mov',
      type: DatasetItemType.playbackVideo,
      isDicom: false,
      isPdf: false
    })
  })
})
