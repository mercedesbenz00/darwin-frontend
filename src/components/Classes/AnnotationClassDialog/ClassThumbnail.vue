<template>
  <div
    class="class-thumbnail"
    :class="{ 'class-thumbnail--selected': selected }"
  >
    <img
      v-if="image.crop_url || image.original_image_url"
      class="class-thumbnail__img"
      :src="image.crop_url || image.original_image_url"
      @click="selectFile"
      @load="onImageLoaded"
    >
    <drop-area
      v-else
      :accepted-file-types="types"
      class="class-thumbnail__droparea"
      mode="single"
      @file-added="addFile"
    >
      <plus-icon />
    </drop-area>
    <header-4 class="class-thumbnail__index">
      {{ image.index + 1 }}
    </header-4>
    <div
      v-if="image.original_image_url"
      class="class-thumbnail__remove"
      role="button"
      @click="removeFile"
    >
      <x-icon />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { PlusIcon, XIcon } from '@/assets/icons/V1'
import DropArea from '@/components/Common/DropArea/V1/DropArea.vue'
import Header4 from '@/components/Common/Header4.vue'
import {
  createClassImageUploadInfo
} from '@/store/modules/aclass/actions/createClassImageUploadInfo'
import { StoreActionPayload, StoreActionResponse, TeamPayload } from '@/store/types'
import { constructError } from '@/utils'
import { uploadToS3 } from '@/utils/api'

import { PendingClassImage } from './types'

/**
 * Renders a single "thumbnail" in the list of thumbnails on the class dialog.
 *
 * Works as a dropzone and allows uploading local files to s3.
 *
 * Emits 'update' events when an image is dropped/picked, as well as when the img element
 * loads the src and the dimensions of the image become known.
 *
 * Also has a selected state, and emits `select` events when clicked
 */
@Component({
  name: 'class-thumbnail',
  components: { DropArea, Header4, PlusIcon, XIcon }
})
export default class ClassThumbnail extends Vue {
  @Prop({ required: true, type: Object as () => PendingClassImage })
  image!: PendingClassImage

  @Prop({ required: true, type: Object as () => TeamPayload })
  team!: TeamPayload

  @Prop({ required: false, type: Boolean, default: false })
  selected!: boolean

  readonly types = [
    'image/*',
    '.bmp',
    '.jpg',
    '.jpeg',
    '.png'
  ]

  status: 'empty' | 'uploading' | 'uploaded' = 'empty'

  async addFile (file: File) {
    this.status = 'uploading'

    // generate upload info

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
      type: 'annotation_class'
    }

    const response: StoreActionResponse<Action> =
      await this.$store.dispatch('aclass/createClassImageUploadInfo', payload)

    if ('error' in response) {
      return this.$store.dispatch('toast/warning', { content: response.error.message })
    }

    // upload image to s3

    const uploadResponse = await uploadToS3(response.data.upload_url, file, 'image/*')
    if (uploadResponse.status >= 400) {
      const response = constructError('ANNOTATION_CLASS_THUMBNAIL_UPLOAD_FAILED')
      return this.$store.dispatch('toast/warning', { content: response.error.message })
    }

    // update image data

    const updated: PendingClassImage = {
      ...this.image,
      id: response.data.id,
      key: response.data.key,
      original_image_url: response.data.url
    }

    this.$emit('update', updated)
  }

  /**
   * Removing the main image file means all the data on it except id and index
   * is completely invalid
   */
  removeFile () {
    const { id, index } = this.image
    const updatedImage: PendingClassImage = { id, index }
    this.$emit('update', updatedImage)
  }

  selectFile () {
    this.$emit('select', this.image)
  }

  /**
   * When the image loads, by src, we know it's width and height,
   * so we can emit an update event to the parent
   */
  onImageLoaded (event: Event) {
    if (!event.target) { return }
    const target: HTMLImageElement = event.target as HTMLImageElement

    if (this.image.image_height && this.image.image_width) { return }

    const updated: PendingClassImage = {
      ...this.image,
      image_width: target.naturalWidth,
      image_height: target.naturalHeight
    }

    this.$emit('update', updated)
  }
}
</script>

<style lang="scss" scoped>
.class-thumbnail {
  height: 100%;
  width: 100%;

  border: 3px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color, .2s ease;

  @include aspectRatio("1:1");
}

.class-thumbnail--selected {
  border-color: $colorAliceNight;
}

.class-thumbnail__droparea {
  border: none;
  background: $colorAliceShade;
  color: $colorAliceBlue;
}

.class-thumbnail__img,
.class-thumbnail__droparea {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.class-thumbnail__droparea {
  display: grid;
  align-items: center;
}

.class-thumbnail__droparea svg {
  height: 80%;
}

.class-thumbnail__index {
  background: $colorAliceBlue;
  color: $colorAliceNight;

  border-top-right-radius: 10px;
  padding: 1px 5px 0 5px;

  top: unset;
  right: unset;
}

.class-thumbnail__remove {
  @include row--center;
  left: unset;
  bottom: unset;

  width: 20px;
  height: 20px;
  padding: 5px;

  cursor: pointer;
  color: $colorAliceBlue;
  transition: color .2s ease;

  svg {
    width: 100%;
    height: 100%;
  }
}

.class-thumbnail__remove:hover {
  color: $colorAliceNight;
}
</style>
