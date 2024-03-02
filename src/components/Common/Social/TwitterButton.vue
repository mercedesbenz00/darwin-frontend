<template>
  <button
    :url="url"
    :description="description"
    :isBlank="isBlank"
    class="share-button share-button--twitter"
    type="button"
    @click="openShareWindow"
  >
    <img
      v-if="customIcon"
      :src="customIcon"
      alt=""
    >
    <icon
      icon-name="Twitter"
      class="share-button__icon"
      v-if="hasIcon === true"
    >
      <path
        d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574
           2.163-2.723-.951.555-2.005.959-3.127
           1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917
           0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64
           3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188
           4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946
           4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953
           2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39
           0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0
           13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56
           2.46-2.548l-.047-.02z"
      />
    </icon>
    <span
      v-if="btnText"
      class="share-button__text"
    >{{ btnText }}</span>
  </button>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import { createWindow } from './helpers'
import Icon from './icon/Icon.vue'

@Component({
  name: 'twitter-button',
  components: {
    Icon
  }
})
export default class TwitterButton extends Vue {
  @Prop({ required: false, type: String, default: '' })
  url!: string

  @Prop({ required: false, type: String, default: '' })
  description!: string

  @Prop({ required: false, type: String, default: 'Twitter' })
  btnText!: string

  @Prop({ required: false, type: Number, default: 500 })
  modalWidth!: number

  @Prop({ required: false, type: Number, default: 500 })
  modalHeight!: number

  @Prop({ required: false, type: Boolean, default: true })
  isBlank!: boolean

  @Prop({ required: false, type: Boolean, default: true })
  hasIcon!: boolean

  @Prop({ required: false, type: String, default: '' })
  customIcon!: string

  openShareWindow () {
    const configWindow = createWindow(
      this.modalWidth,
      this.modalHeight
    )
    const url = `https://twitter.com/share?url=${encodeURIComponent(
      this.url
    )}&text=${encodeURIComponent(this.description)}`

    return this.isBlank
      ? window.open(url, '_blank')
      : window.open(url, 'Share this', configWindow)
  }
}
</script>

<style lang="scss" scoped>
$main-color: $colorGray20;
$focus-color: $colorGrayShadow;
$hover-color: $colorGrayShadow;

.share-button * {
  box-sizing: border-box;
}

.share-button {
  display: inline-block;
  min-width: 42px;
  min-height: 42px;
  padding: 4px 12px;
  color: $colorContentDefault;
  background-color: $main-color;
  @include typography(md-1, inter, 500);
  vertical-align: top;
  user-select: none;
  border: none;
  border-radius: 20px;
  box-shadow: none;
  text-rendering: auto;
  text-indent: 0;
  text-align: center;
  letter-spacing: normal;
  word-spacing: normal;
  text-shadow: none;
  transition: color 0.3s ease-in-out, background-color 0.3s ease-in-out,
  border-color 0.3s ease-in-out;

  &:disabled {
    opacity: 0.9;
  }

  &:focus {
    background-color: $focus-color;
  }

  &:hover {
    background-color: $hover-color;
  }

  &:not(:disabled):not(.disabled) {
    cursor: pointer;
  }

  &:last-child {
    margin-right: 0;
  }

  &__icon {
    display: inline-block;
    padding: 0;
    margin: 0 4px;
    font-size: 0;
    vertical-align: middle;

    path {
      fill: hsla(203, 89%, 53%, 1);;
    }

    &:last-child {
      margin: 0;
    }
  }

  &__text {
    display: inline-block;
    margin: 0 7px;
    vertical-align: middle;
  }
}

@media (max-width: 768px) {
  .share-button {
    min-width: 38px;
    min-height: 38px;
    padding: 8px 8px;
    margin: 2px;

    &__icon {
      width: 18px;
      height: 18px;
      margin: 0 4px;
    }

    &__text {
      margin: 0 4px;
      font-size: 14px;
    }
  }
}
</style>
