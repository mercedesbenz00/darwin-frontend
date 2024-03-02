<template>
  <annotation-class-section
    :title="'Thumbnail'"
    :error="null"
  >
    <template #label>
      <info title="Class Thumbnail">
        Choose a thumbnail to represent this class from an image within the
        dataset. This helps your team and Annotators in identifying this entity.
        <br>
        <br>If you can't find the object you're looking for on the preview
        images you can add the thumbnail later, when the raw data upload is
        complete.
      </info>
    </template>
    <div class="class-thumbnails">
      <thumbnail-cropper
        v-if="selectedImage && selectedImage.original_image_url"
        :image="selectedImage"
        @update="onUpdate"
        @crop="onCropData"
      />
      <div
        v-else
        class="class-thumbnails__placeholder"
        :style="{ background: classColor }"
      >
        {{ className }}
      </div>
      <div class="class-thumbnails__list">
        <class-thumbnail
          v-for="image in images"
          :key="image.id"
          :selected="selectedImage && selectedImage.id === image.id"
          :team="team"
          :image="image"
          @select="onSelect"
          @update="onUpdate"
        />
      </div>
    </div>
  </annotation-class-section>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import Info from '@/components/Common/Info.vue'
import {
  createClassImageUploadInfo
} from '@/store/modules/aclass/actions/createClassImageUploadInfo'
import {
  StoreActionPayload,
  StoreActionResponse,
  TeamPayload,
  TeamUploadInfoPayload
} from '@/store/types'
import { constructError } from '@/utils'
import { uploadToS3 } from '@/utils/api'

import ClassThumbnail from './ClassThumbnail.vue'
import ThumbnailCropper from './ThumbnailCropper.vue'
import AnnotationClassSection from './components/Common/AnnotationClassSection.vue'
import { PendingClassImage } from './types'

@Component({
  name: 'class-thumbnails',
  components: { AnnotationClassSection, ClassThumbnail, Info, ThumbnailCropper }
})
export default class ClassThubmnails extends Vue {
  @Prop({ required: true, type: String })
  className!: string

  @Prop({ required: true, type: String })
  classColor!: string

  @Prop({ required: true, type: Object as () => TeamPayload })
  team!: TeamPayload

  @Prop({ required: true, type: Array as () => PendingClassImage[] })
  images!: PendingClassImage[]

  mounted () {
    this.setImages()
  }

  @Watch('images')
  setImages () {
    this.selectedImageId = this.selectedImageId || this.images[0]?.id || null
  }

  /**
   * ThumbnailCropper emits an event when actual blob crop data for the specified crop is ready
   *
   * This event handler takes the image and the blob data and
   *
   * - requests an upload url from backend
   * - uploads the blog to that url
   * - emits `images:updated` with the updated image (containing new `crop_key` and `crop_url`)
   *
   * This allows the parent dialog, when saving, to directly save the new crop url
   *
   * If the dialog is cancelled out, nothing is persisted yet, so the changes are simply discarded
   *
   * What currently doesn't happen is, the uploaded thumbnails remain on S3
   */
  async onCropData (image: PendingClassImage, cropData: Blob) {
    const { uploadInfo } = this
    if (!uploadInfo) { return }

    // upload to s3

    const uploadResponse = await uploadToS3(uploadInfo.upload_url, cropData, 'image/*')
    if (uploadResponse.status >= 400) {
      const response = constructError('ANNOTATION_CLASS_THUMBNAIL_UPLOAD_FAILED')
      return this.$store.dispatch('toast/warning', { content: response.error.message })
    }

    // emit event

    const updated: PendingClassImage = {
      ...image,
      id: uploadInfo.id,
      crop_key: uploadInfo.key,
      crop_url: uploadInfo.url
    }

    this.onUpdate(updated)
  }

  onUpdate (image: PendingClassImage) {
    const listIndex = this.images.findIndex(t => t.index === image.index)

    const newImages = [...this.images]
    newImages.splice(listIndex, 1, image)

    this.$emit('update:images', newImages)

    /** We only select the image when it was fully loaded (known size) */
    if (image.image_width && image.image_height) {
      this.onSelect(image)
    }
  }

  selectedImageId: string | null = null
  uploadInfo: TeamUploadInfoPayload | null = null

  get selectedImage (): PendingClassImage | null {
    return this.images.find(i => i.id === this.selectedImageId) || null
  }

  onSelect (image: PendingClassImage) {
    this.selectedImageId = image.id
  }

  @Watch('selectedImage.id')
  async regenerateCropUrl () {
    const { selectedImage } = this
    if (!selectedImage) { return }

    type Action = typeof createClassImageUploadInfo

    /**
     * Note: We should allow the backend to generate a new id for us. On class save,
     * if the image has changed, we should discard the old one and use the new one.
     *
     * This is why we DON'T send the image.id as part of the action payload.
     *
     * If we were to reuse the same id, the background upload would overwrite the crop
     * on S3 even if the don't save the class.
     */
    const payload: StoreActionPayload<Action> = {
      team: this.team,
      type: 'annotation_class_crop'
    }

    const response: StoreActionResponse<Action> =
      await this.$store.dispatch('aclass/createClassImageUploadInfo', payload)

    if ('error' in response) {
      return this.$store.dispatch('toast/warning', { content: response.error.message })
    }

    this.uploadInfo = response.data
  }
}
</script>

<style lang="scss" scoped>
.class-thumbnails {
  display: grid;
  grid-template-rows: auto auto;
  row-gap: 20px;
}

.class-thumbnails__list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  column-gap: 15px;
  max-width: 100%;
  min-width: 0;
}

.class-thumbnails__placeholder {
  color: $colorWhite;
  height: 250px;
  @include typography(xxl-1, default, bold);
  display: grid;
  align-items: center;
  justify-content: center;
}
</style>
