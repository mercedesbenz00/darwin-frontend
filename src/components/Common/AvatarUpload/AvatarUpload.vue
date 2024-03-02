<template>
  <div
    v-loading="loading"
    class="avatar"
    :class="{
      'avatar--has-image': !!source || clearbitLoaded,
      'avatar--uploadable': canUpload
    }"
    :loading-options="{
      backgroundColor: 'transparent',
      label: null,
      size: 'small',
      minTimeout: 2000
    }"
  >
    <img
      v-if="source"
      :key="source"
      v-lazy="source"
      class="avatar__img"
    >
    <clearbit-logo
      v-else
      class="avatar__img"
      :company-url="companyUrl"
      @load="onClearbitLoad"
      @error="onClearbitError"
    >
      <div
        v-if="!canUpload"
        class="avatar__initials"
      >
        {{ initials }}
      </div>
    </clearbit-logo>

    <template v-if="canUpload">
      <div class="avatar__button">
        <upload-button />
      </div>

      <input
        type="file"
        accept="image/*"
        class="avatar__input"
        :disabled="disabled"
        @change="onFile"
      >
    </template>
  </div>
</template>

<script lang="ts">
import md5 from 'blueimp-md5'
import { Component, Prop, Vue } from 'vue-property-decorator'

import ClearbitLogo from '@/components/Common/ClearbitLogo.vue'
import { getFileFromUrl, getShortenedName, readFileAsBinary, readFileAsData } from '@/utils'

import UploadButton from './UploadButton.vue'
import { AvatarUploadData } from './types'

@Component({
  name: 'avatar-upload',
  components: { ClearbitLogo, UploadButton }
})
export default class AvatarUpload extends Vue {
  @Prop({ default: null, type: String })
  src!: string | null

  @Prop({ default: '', type: String })
  name!: string

  @Prop({ type: String })
  companyUrl?: string

  @Prop({ default: false, type: Boolean })
  canUpload!: boolean

  @Prop({ default: false, type: Boolean })
  disabled!: boolean

  @Prop({ default: false, type: Boolean })
  loading!: boolean

  @Prop({ default: false, type: Boolean })
  showChange!: boolean

  clearbitLoaded: boolean = false
  image: string | ArrayBuffer | null = null

  get initials () {
    return getShortenedName(this.name)
  }

  get source () {
    return this.image || this.src
  }

  async onClearbitLoad (url: string) {
    this.clearbitLoaded = true
    const file = await getFileFromUrl('logo.png', url)
    const binaryContent = await readFileAsBinary(file)
    const hash = md5(binaryContent)
    const eventParams: AvatarUploadData = {
      hash,
      file,
      type: file ? file.type : null
    }
    this.$emit('change', eventParams)
  }

  onClearbitError () {
    this.clearbitLoaded = false
    if (this.source) { return }
    this.$emit('change', null)
  }

  async onFile (event: Event) {
    const input = (event.target! as HTMLInputElement)
    const files = input.files

    if (!files || files.length === 0) { return }
    const file = files[0]
    const [image, binaryContent] = await Promise.all([
      readFileAsData(file),
      readFileAsBinary(file)
    ])

    this.image = image

    const hash = md5(binaryContent)
    const eventParams: AvatarUploadData = {
      hash,
      file,
      type: file ? file.type : null
    }
    this.$emit('change', eventParams)
  }
}
</script>

<style lang="scss" scoped>
$size: 120px;

.avatar {
  position: relative;
  @include col--center;
  width: $size;
  height: $size;
  min-width: $size;
  min-height: $size;
  border: 10px solid $colorAliceBlue;
  border-radius: 50%;
  overflow: hidden;
  background: $colorAliceShade;
  box-shadow: 0px 3px 5px rgba(145, 169, 192, 0.3);
  transition: all .2s ease-in-out;
}

.avatar--has-image {
  .avatar__button {
    opacity: 0;
  }

  &:hover,
  &:active {
    .avatar__button {
      opacity: 1.0;
      background: transparentize($color90Black, 0.6);
    }
  }
}

.avatar--uploadable:hover {
  background: $colorAliceShadow;
}

.avatar__img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  overflow: hidden;
}

.avatar__button {
  position: absolute;
  @include fullsize;
  cursor: pointer;
  transition: all .2s ease-in-out;
}

.avatar__initials {
  position: absolute;
  @include fullsize;
  @include row--center;
  @include typography(md-1, default);
  border-radius: 50%;
  color: $colorGrayLite2;
  text-align: center;
  @include noSelect;
}

.avatar__input {
  position: absolute;
  @include fullsize;
  border-radius: 50%;
  opacity: 0;
  cursor: pointer;

  input {
    cursor: pointer;
  }

  &::-webkit-file-upload-button {
    cursor: pointer;
  }
}
</style>
