import { Editor } from '@/engine/editor'
import { View, VideoView, StreamView } from '@/engine/models/views'
import { DatasetItemPayload } from '@/store/types'

/**
 * Manage the relationship between item and IView interface implementations.
 */
export class ViewCreator {
  private editor: Editor

  constructor (editor: Editor) {
    this.editor = editor
  }

  /**
   * Returns true if the item is streamable video.
   *
   * @param item
   * @returns
   */
  isVideoStreamItem (item: DatasetItemPayload): boolean {
    const isFeatureEnabled = this.editor
      .store
      .getters['features/isFeatureEnabled'] as (feature: string) => boolean
    return !!item?.dataset_video?.streamable && isFeatureEnabled('VIDEO_STREAM')
  }

  isVideoItem (item: DatasetItemPayload): boolean {
    return (
      item?.dataset_video?.metadata.type === 'video' ||
      (
        item?.dataset_video?.metadata.type === 'dicom' &&
        !item?.dataset_video?.metadata.layout
      )
    )
  }

  /**
   * Returns item constructor related to the item.
   *
   * - Returns StreamView for streamable video item.
   * - Returns View by default
   * @param item
   * @returns
   */
  getItemConstructor (item: DatasetItemPayload | null): typeof View {
    if (item && this.isVideoStreamItem(item)) {
      return StreamView
    } else if (item && this.isVideoItem(item)) {
      return VideoView
    }

    return View
  }

  /**
   * Compares constructors related to items A & B.
   *
   * @param aItem
   * @param bItem
   * @returns
   */
  haveSameItemConstructor (
    aItem: DatasetItemPayload | null,
    bItem: DatasetItemPayload | null
  ): boolean {
    return this.getItemConstructor(aItem) === this.getItemConstructor(bItem)
  }

  /**
   * Returns View instance.
   *
   * @returns
   */
  createDefaultView (): View {
    return new View(
      this.editor,
      this.editor.store,
      {
        toolManager: this.editor.toolManager,
        actionManager: this.editor.actionManager
      }
    )
  }

  /**
   * Returns an instance of the view related to the item.
   *
   * - Will return View instance for 'null'
   * @param item
   * @returns
   */
  createForItem (item: DatasetItemPayload | null): View {
    if (item) {
      return new (this.getItemConstructor(item))(
        this.editor,
        this.editor.store,
        {
          toolManager: this.editor.toolManager,
          actionManager: this.editor.actionManager
        }
      )
    }

    return this.createDefaultView()
  }
}
