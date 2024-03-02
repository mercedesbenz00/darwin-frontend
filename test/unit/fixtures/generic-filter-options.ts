import {
  buildDatasetFolderPayload,
  buildDatasetItemFilenamePayload,
  buildMembershipPayload
} from 'test/unit/factories'

import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'
import { DatasetItemType } from '@/store/types'

export const firstAssigneeOption: GenericFilterOptionType = {
  id: 'annotator-1',
  label: 'Test Annotator1',
  type: 'assignees',
  includeHeader: true,
  data: buildMembershipPayload({
    id: 1,
    first_name: 'Test',
    last_name: 'Annotator1'
  })
}

export const assigneeOption: GenericFilterOptionType = {
  id: 'annotator-2',
  label: 'Test Annotator 2',
  type: 'assignees',
  includeHeader: false,
  data: buildMembershipPayload({
    id: 2,
    first_name: 'Test',
    last_name: 'Annotator2'
  })
}

export const firstFilenameOption: GenericFilterOptionType = {
  id: 'filename-1.jpg',
  label: '1.jpg',
  type: 'filenames',
  includeHeader: true,
  data: buildDatasetItemFilenamePayload()
}

export const imageFilenameOption: GenericFilterOptionType = {
  id: 'filename-2.jpg',
  label: '2.jpg',
  type: 'filenames',
  includeHeader: false,
  data: buildDatasetItemFilenamePayload({ filename: '2.jpg' })
}

export const dicomFilenameOption: GenericFilterOptionType = {
  id: 'filename-3.dcm',
  label: '3.dcm',
  type: 'filenames',
  includeHeader: false,
  data: buildDatasetItemFilenamePayload({
    filename: '3.dcm',
    type: DatasetItemType.playbackVideo,
    isDicom: true,
    isPdf: false
  })
}

export const pdfFilenameOption: GenericFilterOptionType = {
  id: 'filename-3.pdf',
  label: '3.pdf',
  type: 'filenames',
  includeHeader: false,
  data: buildDatasetItemFilenamePayload({
    filename: '3.pdf',
    type: DatasetItemType.playbackVideo,
    isDicom: false,
    isPdf: true
  })
}

export const videoFilenameOption: GenericFilterOptionType = {
  id: 'filename-4.mpg',
  label: '4.mpg',
  type: 'filenames',
  includeHeader: false,
  data: buildDatasetItemFilenamePayload({
    filename: '4.mpg',
    type: DatasetItemType.playbackVideo,
    isDicom: false
  })
}

export const firstFolderOption: GenericFilterOptionType = {
  id: 'folder-/folder1',
  label: '/folder1',
  type: 'paths',
  includeHeader: true,
  data: buildDatasetFolderPayload({ path: '/folder1' })
}

export const folderOption: GenericFilterOptionType = {
  id: 'folder-/folder2',
  label: '/folder2',
  type: 'paths',
  includeHeader: false,
  data: buildDatasetFolderPayload({ path: '/folder2' })
}
