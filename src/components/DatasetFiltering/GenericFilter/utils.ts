import mime from 'mime'

import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter'
import {
  DatasetFolderPayload,
  DatasetItemFilenamePayload,
  DatasetItemType,
  DatasetPayload,
  MembershipPayload,
  V2DatasetFolderPayload
} from '@/store/types'
import { getFullName } from '@/utils'

export const membershipToOption = (member: MembershipPayload): GenericFilterOptionType => ({
  id: `annotator-${member.id}`,
  label: getFullName(member),
  type: 'assignees',
  includeHeader: false,
  data: member
})

export const folderToOption = (
  folder: DatasetFolderPayload,
  dataset: DatasetPayload
): GenericFilterOptionType => ({
  id: `folder-${folder.path}`,
  label: folder.path === '/' ? dataset.name : folder.path,
  type: 'paths',
  includeHeader: false,
  data: folder
})

export const folderToOptionV2 = (
  folder: V2DatasetFolderPayload,
  dataset: DatasetPayload
): GenericFilterOptionType => ({
  id: `folder-${folder.path}`,
  label: folder.path === '/' ? dataset.name : folder.path,
  type: 'paths',
  includeHeader: false,
  data: folder
})

export const filenameToOption = (
  item: DatasetItemFilenamePayload
): GenericFilterOptionType => ({
  id: `filename-${item.filename}`,
  label: item.filename,
  type: 'filenames',
  includeHeader: false,
  data: item
})

/**
 * By default, we don't load all the filenames in the initial load.
 * Although if the route query contains the filename,
 * predict the filetype from its filename,
 * so that we can show proper icons in the generic filter.
 */
export const filenameStringToFilenamePayload = (
  filename: string
): DatasetItemFilenamePayload => {
  const data: DatasetItemFilenamePayload = {
    filename,
    type: DatasetItemType.image,
    isDicom: false,
    isPdf: false
  }

  const ext = filename.split('.').pop()
  if (!ext) { return data }

  if (ext.toLowerCase() === 'dcm') {
    data.type = DatasetItemType.playbackVideo
    data.isDicom = true
    return data
  }

  if (ext.toLowerCase() === 'pdf') {
    data.type = DatasetItemType.playbackVideo
    data.isPdf = true
    return data
  }

  const type = mime.getType(ext.trim() || '')
  if (type && type.startsWith('video')) {
    data.type = DatasetItemType.playbackVideo
    return data
  }

  return data
}
