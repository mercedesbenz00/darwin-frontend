<template>
  <div
    class="inference"
    :class="{'inference--with-image': hasImageData}"
  >
    <DropArea
      ref="droparea"
      :accepted-file-types="supportedFileTypes"
      :multiple="false"
      :open-file-picker-on-click="false"
      @file-added="processImage"
    >
      <InferenceData
        v-if="imageData"
        v-loading="loading"
        :loading-options="{
          label: status === 'loading_image' ? 'Loading image...' : 'Running inference...',
          backgroundColor: 'rgb(255, 255, 255)'
        }"
        class="inference__data"
        :mode="mode"
        :image-data="imageData"
        :classes="classes"
        :inference-results="inferenceResults"
        @repick="reset"
        @stop-stream="stopStream"
      />
      <div
        v-else
        class="inference__placeholders"
      >
        <div
          class="inference__placeholder__item inference__placeholder__item__camera"
          @click="openFileDialog"
        >
          <CameraIcon />
          <label>Upload an image</label>
        </div>
        <div
          class="inference__placeholder__item inference__placeholder__item__stream"
          @click="startStream"
        >
          <StreamIcon />
          <label>Stream from webcam</label>
        </div>
      </div>
    </DropArea>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref } from 'vue'

import DropArea from '@/components/Common/DropArea/V1/DropArea.vue'
import { useStore } from '@/composables/useStore'
import { InferenceResult } from '@/engineCommon/backend'
import { runInference } from '@/store/modules/neuralModel/actions/runInference'
import {
  RunningSessionPayload,
  StoreActionPayload,
  StoreActionResponse
} from '@/store/types'
import { readFileAsData } from '@/utils'

import InferenceData from './ModelInference/InferenceData.vue'
import CameraIcon from './assets/camera.svg?inline'
import StreamIcon from './assets/stream.svg?inline'

export default defineComponent({

  name: 'ModelInference',
  components: { CameraIcon, DropArea, InferenceData, StreamIcon },
  props: {
    runningSession: { type: Object as () => RunningSessionPayload, required: true }
  },
  setup (props) {
    const mode = ref<'image' | 'video'>('image')
    const status = ref<'initial' | 'loading_image' | 'infering' | 'done'>('initial')

    const loading = computed<boolean>(() =>
      mode.value !== 'video' &&
      (status.value === 'loading_image' || status.value === 'infering')
    )

    const supportedFileTypes = ['.png', '.jpg', '.jpeg', '.bmp']

    const imageData = ref<string | null>(null)
    const hasImageData = computed<boolean>(() => !!imageData.value)

    const reset = (): void => {
      imageData.value = null
      status.value = 'initial'
    }

    const inferenceResults = ref<InferenceResult[]>([])

    const store = useStore()

    let intervalId: ReturnType<typeof setTimeout> | null = null
    let stream: MediaStream | null = null

    const infer = (
      payload: StoreActionPayload<typeof runInference>
    ): Promise<StoreActionResponse<typeof runInference>> =>
      store.dispatch('neuralModel/runInference', payload)

    const startStream = async (): Promise<void>  => {
      mode.value = 'video'
      const video = document.createElement('video')

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 426, height: 240 }
        })
      } catch (e: unknown) {
        const action = 'toast/warning'
        store.dispatch(action, { content: 'Please enable your camera' })
        status.value = 'done'
        return
      }

      video.srcObject = stream
      video.play()

      const getFrame = async (): Promise<void> => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(video, 0, 0)
        const canvasImageData = canvas.toDataURL('image/png')

        if (canvasImageData.length < 100) { return }

        imageData.value = canvasImageData

        if (status.value === 'infering') { return }

        const base64 = imageData.value.replace(/^data:image\/[a-z]+;base64,/, '')
        status.value = 'infering'

        const response = await infer({ runningSession: props.runningSession, image: { base64 }})

        status.value = 'done'

        if ('error' in response) {
          store.dispatch('toast/warning', { content: response.error.message })
          return reset()
        }

        inferenceResults.value = response.data.result
      }

      intervalId = setInterval(() => getFrame(), 1000 / 3)
    }

    const stopStream = (): void => {
      if (!intervalId || !stream) { return }
      clearInterval(intervalId)
      intervalId = null
      imageData.value = null
      stream.getTracks().forEach(track => track.stop())
      stream = null
    }

    onBeforeUnmount(() => { stopStream() })

    const processImage = async (image: File): Promise<void> => {
      status.value = 'loading_image'
      imageData.value = await readFileAsData(image)

      const base64 = imageData.value.replace(/^data:image\/[a-z]+;base64,/, '')
      status.value = 'infering'

      const response = await infer({ runningSession: props.runningSession, image: { base64 } })

      if ('error' in response) {
        store.dispatch('toast/warning', { content: response.error.message })
        return reset()
      }

      inferenceResults.value = response.data.result
      status.value = 'done'
    }

    const classes = computed(() =>  props.runningSession.meta.classes || [])

    const droparea = ref<InstanceType<typeof DropArea> | null>(null)

    const openFileDialog = (): void => {
      mode.value = 'image'
      droparea.value?.input?.click()
    }

    return {
      classes,
      droparea,
      hasImageData,
      imageData,
      inferenceResults,
      loading,
      mode,
      openFileDialog,
      processImage,
      reset,
      startStream,
      status,
      stopStream,
      supportedFileTypes,
    }
  }
})

</script>

<style lang="scss" scoped>
.inference {
  height: 100%;
  width: 100%;

  .droparea {
    background: transparent;
    border-color: $colorSecondaryLight;
  }

  &--with-image {
    @include aspectRatio("16:9");

    .droparea {
      display: block;
      height: 100%;
      padding: 0;
      border: none;

      > :first-child {
        height: 100%;
      }
    }
  }

  .inference__data {
    height: 100%;
    overflow: hidden;
  }
}

.inference__placeholders {
  @include row--distributed;

  div {
    @include col--center;
    margin: 0 20px;
    padding: 20px;
    border-radius: 5px;

    &:hover {
      cursor: pointer;
      background-color: $colorSecondaryLight1;
    }
  }

  div svg {
    margin-bottom: 10px;
  }

  div label {
    color: $colorSecondaryLight;
    font-size: 12px;
    display: block;
    clear: both;
  }
}
</style>
