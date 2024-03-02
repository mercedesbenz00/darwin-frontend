import { Editor } from '@/engineV2/editor'
import {
  View,
  ImageView,
  VideoView,
  StreamView,
  DicomView,
  PdfView,
  TiledView
} from '@/engineV2/views'
import { DatasetItemType } from '@/store/types'
import { V2DatasetItemPayload } from '@/store/types/V2DatasetItemPayload'
import { V2DatasetItemSlot } from '@/store/types/V2DatasetItemSlot'

type ViewType =
  typeof ImageView |
  typeof VideoView |
  typeof StreamView |
  typeof DicomView |
  typeof TiledView |
  typeof PdfView

/**
 * Manage the relationship between item and View implementations.
 */
export class ViewCreator {
  private editor: Editor

  constructor (editor: Editor) {
    this.editor = editor
  }

  private getConstructorByType (type: DatasetItemType, file: V2DatasetItemSlot): ViewType {
    switch (type) {
    case 'pdf':
      return PdfView
    case 'image':
      if (file.metadata?.levels) {
        return TiledView
      }

      return ImageView
    case 'video': {
      const isFeatureEnabled = this.editor
        .store
        .getters['features/isFeatureEnabled'] as (feature: string) => boolean

      if (file.metadata?.segment_index && isFeatureEnabled('VIDEO_STREAM')) {
        return StreamView
      }
      return VideoView
    }
    case 'dicom':
      return DicomView
    default:
      throw new TypeError("Can't handle view type!")
    }
  }

  createForType (file: V2DatasetItemSlot, item: V2DatasetItemPayload): View {
    return new (
      this.getConstructorByType(
        file.type || DatasetItemType.image,
        file
      )
    )(this.editor, file, item)
  }
}
