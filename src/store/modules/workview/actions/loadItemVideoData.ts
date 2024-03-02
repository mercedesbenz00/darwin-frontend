import {
  LoadedFrame,
  LoadedVideo,
  WorkviewAction
} from '@/store/modules/workview/types'
import { DatasetItemPayload, VideoFramePayload } from '@/store/types'
import { api, isErrorResponse, parseError } from '@/utils'

type Action = WorkviewAction<DatasetItemPayload, LoadedVideo | undefined>

function chunkArray<T> (array: Array<T>, chunkSize: number = 100): T[][] {
  const res = []
  for (let i = 0; i < array.length; i += chunkSize) {
    res.push(array.slice(i, i + chunkSize))
  }

  return res
}

let request: { id: number, promise: Promise<any> } | null = null

export const loadItemVideoData: Action =
  async ({ commit, state }, item) => {
    const matched = state.loadedVideos.find(v => v.id === item.dataset_video_id)
    if (matched) { return { data: matched } }

    if (!request || request?.id !== item.id) {
      const path = `dataset_items/${item.id}/frames`
      request = {
        id: item.id,
        promise: api.get(path)
      }
    }

    let response: { data: VideoFramePayload[] }
    try {
      response = await request.promise
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error)
    } finally {
      request = null
    }

    // Do not save videos to prevent memory leak
    commit('CLEAR_LOADED_VIDEO')

    if (item.dataset_video?.metadata.type === 'video') {
      let framesChunks
      if (Array.isArray(response.data) && response.data.length > 0) {
        framesChunks = chunkArray<VideoFramePayload>(response.data, 100)
      } else {
        framesChunks = [response.data]
      }

      commit('PUSH_LOADED_VIDEO', {
        payload: item.dataset_video,
        loadedFrames: framesChunks.shift()
      })

      // TODO: replace chunks with BackEnd pagination once
      framesChunks.forEach((frames, index) => {
        setTimeout(() => {
          const loadedFrames: { [key: string]: LoadedFrame } = {}
          for (let i = 0; i < frames.length; i++) {
            const frame = frames[i]
            loadedFrames[i + (100 * (index + 1))] = {
              hqUrl: frame.hq_key,
              lqUrl: frame.lq_key,
              seq: i + index,
              hqData: null,
              lqData: null,
              hqDataLoaded: false,
              lqDataLoaded: false
            }
          }

          commit('PUSH_VIDEO_FRAMES', {
            id: item.dataset_video_id,
            loadedFrames
          })
        }, 100 * index)
      })
    } else {
      commit('PUSH_LOADED_VIDEO', {
        payload: item.dataset_video,
        loadedFrames: response.data
      })
    }

    return { data: state.loadedVideos.find(v => v.id === item.dataset_video_id) }
  }
