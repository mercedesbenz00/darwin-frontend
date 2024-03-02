import { SetupContext } from 'vue'

import { UploadFileSet } from '@/components/Dataset/DropZone/types'

import { useDatasetUpload } from './useDatasetUpload'

type DropZoneEmit = SetupContext<['files-added', 'files-updated', 'files-removed']>['emit']

/**
 * Used to hold shared logic between v1 and v2 dataset upload DropZone components
 * This includes V1 DroppedFiles component
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useDatasetUploadDropzone = (emit: DropZoneEmit) => {
  const { createUploadFiles, updateUploadFiles, removeUploadFiles} = useDatasetUpload()

  /**
   * Called when a user drops a set of items onto the drop zone.
   * Handles processing in the store and emits event
   */
  const addFiles = async (files: FileList | File []): Promise<void> => {
    const uploadFiles = await createUploadFiles(files)
    if (uploadFiles.length === 0) { return }
    emit('files-added', uploadFiles)
  }

  /**
   * Event handler when folder is set with Folder Popover on the UI.
   */
  const setFolder = async (set: UploadFileSet, path: string): Promise<void>  => {
    const { files } = set
    await updateUploadFiles({ files, data: { path } })
    emit('files-updated', files)
  }

  /**
   * Files are grouped in sets (one per group of files dropped/picked)
   *
   * This gets called when the user clicks the remove button on one of the sets.
   */
  const removeSet = async  (set: UploadFileSet): Promise<void> => {
    await removeUploadFiles(set.files)
    emit('files-removed', set.files)
  }

  /** Sets tags on a set of items un the UI */
  const setTags = async (set: UploadFileSet, tags: string[]): Promise<void> => {
    const { files } = set
    await updateUploadFiles({ files, data: { tags } })
    emit('files-updated', files)
  }

  return {
    addFiles,
    setFolder,
    setTags,
    removeSet
  }
}
