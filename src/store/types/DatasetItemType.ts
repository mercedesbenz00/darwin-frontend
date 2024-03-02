/**
 * Enumerates possible types a dataset item can belong to
 */
export enum DatasetItemType {
  /**
   * Item is a plain or possibly tiled image
   */
  image = 'image',
  /**
   * Item is a video uploaded with the setting to annotate as video enabled
   */
  playbackVideo = 'playback_video',
  /**
   * Item is a video with the frame-extraction setting enabled
   */
  splitVideo = 'split_video',
  /**
   * Item is an extracted frame of a `DatasetItemType.splitVideo`
   */
  videoFrame = 'video_frame',

  video = 'video',

  pdf = 'pdf',

  dicom = 'dicom'
}
