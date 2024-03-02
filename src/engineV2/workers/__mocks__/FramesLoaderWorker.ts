export class FramesLoaderWorker {
  onFrameLoaded (clb: (index: number) => void): void {
    clb(0)
  }

  onGetSection (clb: (index: number) => void): void {
    clb(0)
  }

  pushSections = jest.fn().mockResolvedValue(null)
  loadLQFrame = jest.fn().mockResolvedValue(null)
  loadHQFrame = jest.fn().mockResolvedValue(null)
  setFramesToLoad = jest.fn().mockResolvedValue(null)
  setNextFrameToLoad = jest.fn().mockResolvedValue(null)
  cleanup = jest.fn().mockResolvedValue(null)
}
