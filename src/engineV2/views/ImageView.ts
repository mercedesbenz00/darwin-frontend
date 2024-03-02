import { RenderManager } from '@/engineV2/managers'
import { Object2D } from '@/engineV2/models'
import { View } from '@/engineV2/views'

export class ImageView extends View {
  async init (): Promise<void> {
    this.fileManager.loadFrames()

    this.showFramesTool = false

    this.mainLayer.clear()
    this.mainLayer.add(new Object2D(
      'image',
      (ctx, canvas) => {
        if (this.currentFrame) {
          RenderManager.drawImageOnCanvas(
            this,
            canvas,
            this.currentFrame
          )
        }
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
}
