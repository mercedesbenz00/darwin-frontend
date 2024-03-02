import { RenderManager } from '@/engineV2/managers'
import { Object2D } from '@/engineV2/models'
import { VideoView } from '@/engineV2/views'

export class DicomView extends VideoView {
  async init (): Promise<void> {
    this.fileManager.loadFrames()

    this.framesIndexes = this.fileManager.framesIndexes

    this.showFramesTool = this.framesIndexes.length > 1

    // For DICOM we use dark background
    this.mainLayer.canvas.style.background = '#000'

    this.annotationsLayer.clear()
    this.mainLayer.clear()
    this.mainLayer.add(new Object2D(
      'dicom',
      () => {
        if (this.currentFrame) {
          RenderManager.drawDicomImageOnCanvas(
            this,
            this.mainLayer.canvas,
            this.currentFrame,
            this.fileManager.metadata || null
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
