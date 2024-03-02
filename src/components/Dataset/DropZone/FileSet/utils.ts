import { FilesByCategory, THUMB_LIMIT } from './types'

/**
 * Returns a list of thumbnails (as data urls), to be rendered for this set.
 *
 * Relies on a watcher to load those thumbnails first.
 */
export const getThumbnailFromFiles = (files: FilesByCategory): (string | ArrayBuffer)[] => {
  const { videos, images, others } = files
  // get 3 frames for each of the first 3 videos
  const thumbsByVideos = videos.slice(0, THUMB_LIMIT).map(video => video.data.thumbs || [])

  // use first frame from each of the first 3 videos
  const thumbs = thumbsByVideos.map(tv => tv[0])

  if (thumbs.length >= THUMB_LIMIT) { return thumbs }

  // less than 3 videos, next, take available frames from images
  images
    .slice(0, THUMB_LIMIT - thumbs.length)
    .forEach(uploadFile => {
      if (uploadFile.data.dataURL) { thumbs.push(uploadFile.data.dataURL) }
    })

  if (thumbs.length >= THUMB_LIMIT) { return thumbs }

  if (videos.length > 0) {
    // limit still not reached, take remaining frames from first video
    const firstVideo = videos[0]
    if (firstVideo.data.thumbs) {
      thumbs.splice(1, 0, ...firstVideo.data.thumbs.slice(1, THUMB_LIMIT - thumbs.length + 1))
    }
  }

  if (thumbs.length >= THUMB_LIMIT) { return thumbs }

  others
    .slice(0, THUMB_LIMIT - thumbs.length)
    .forEach(uploadFile => {
      if (uploadFile.data.dataURL) { thumbs.push(uploadFile.data.dataURL) }
    })

  return thumbs
}
