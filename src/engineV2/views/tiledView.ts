import { Editor } from '@/engineV2/editor'
import { RenderManager, TilesManager } from '@/engineV2/managers'
import { Object2D } from '@/engineV2/models'
import { Tile } from '@/engineV2/models/tiler'
import { View } from '@/engineV2/views'
import { V2DatasetItemPayload } from '@/store/types/V2DatasetItemPayload'
import { V2DatasetItemSlot } from '@/store/types/V2DatasetItemSlot'

export class TiledView extends View {
  public tilesManager: TilesManager
  private visibleTiles: Tile[] = []

  constructor (public editor: Editor, file: V2DatasetItemSlot, item: V2DatasetItemPayload) {
    super(editor, file, item)

    this.tilesManager = new TilesManager(this)

    this.mainLayer.onBeforeRender(() => {
      this.visibleTiles = this.tilesManager.getVisibleTiles()
    })

    this.init()

    const handleTilesLoaded = (): void => {
      this.loading = false
    }
    this.tilesManager.on('tiles:loaded', handleTilesLoaded)
    this.onCleanup.push(() =>
      this.tilesManager.off('tiles:loaded', handleTilesLoaded)
    )
  }

  async init (): Promise<void> {
    this.camera.setImage({
      width: this.tilesManager.imageWidth,
      height: this.tilesManager.imageHeight
    })

    this.showFramesTool = false

    this.mainLayer.clear()
    this.mainLayer.add(new Object2D(
      'tiled_image',
      () => {
        RenderManager.renderTiledImage(
          this,
          this.visibleTiles,
          this.mainLayer.context
        )
      }
    ))

    // Reset the current image filter's window level
    this.setImageFilter({
      ...this.imageFilter,
      windowLevels: this.defaultWindowLevels,
      isImageSmoothing: this.defaultImageSmoothing
    })

    // Reset tool
    const { currentTool } = this.toolManager
    if (currentTool) { currentTool.tool.reset(currentTool.context) }

    // Clear old action history.
    // We don't want to redo an action from a different image onto this one.
    this.actionManager.clear()

    await this.jumpToFrame(0, true)

    this.scaleToFit()
  }

  get currentViewSize (): { width: number, height: number} | null {
    return this.tilesManager ?
      { width: this.tilesManager.imageWidth, height: this.tilesManager.imageHeight } : null
  }
}
