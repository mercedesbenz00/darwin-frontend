<template>
  <div
    class="imagezone"
    :class="{'imagezone--white': theme === 'white'}"
  >
    <div class="imagezone__images__dialog">
      <div class="imagezone__images__dialog__header">
        <div class="imagezone__images__dialog__header__record">
          <div class="imagezone__images__dialog__header__record__field__name">
            Total Images
          </div>
          <div class="imagezone__images__dialog__header__record__field__value">
            {{ dataset.num_images }}
          </div>
        </div>
      </div>
      <div class="imagezone__images__dialog__files">
        <div class="imagezone__file__cell__container">
          <div class="imagezone__file__cell__container__thumbs">
            <div
              v-for="(thumbnail, index) in dataset.thumbnails.slice(0, 3)"
              :key="`thumb${index}`"
              class="imagezone__file__cell__container__thumb"
            >
              <img :src="thumbnail">
            </div>
          </div>
          <div class="imagezone__file__cell__container__details">
            <div class="imagezone__file__cell__container__details__texts">
              <div class="imagezone__file__cell__container__details__content">
                {{ dataset.num_images }} Images
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ImageZone',
  props: {
    dataset: { type: Object, default: () => null },
    // white, gray(default)
    theme: { type: String, default: 'gray' },
    // normal(default), dialog
    mode: { type: String, default: 'normal' }
  },
  methods: {
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.imagezone {
  width: 100%;
  margin-bottom: 25px;
  position: relative;
}

.imagezone__images__dialog {
  width: 100%;
  height: 215px;
  background: $colorGriteDark;
  border-radius: 10px;
  margin-bottom: 25px;
}

.imagezone__images__dialog__header {
  @include row--distributed;
  width: 100%;
  height: 40px;
  padding: 12px 15px;
  border-radius: 10px 10px 0 0;
  background: $colorGriteDark2;
}

.imagezone__images__dialog__header__record {
  @include row;
}

.imagezone__images__dialog__header__record__field__name {
  margin-right: 10px;
  color: $colorGrayLite;
  @include typography(md, default);
}

.imagezone__images__dialog__header__record__field__value {
  margin-right: 10px;
  color: $colorSecondaryDark1;
  @include typography(md, default, bold);
}

.imagezone__images__dialog__files {
  width: 100%;
  height: calc(100% - 40px);
  overflow: scroll;
}

.imagezone__file__cell__container {
  width: calc(50% - 20px);
  height: 95px;
  margin: 10px;
  border-radius: 10px;
  background: white;
  position: relative;
}

.imagezone__file__cell__container__thumbs {
  @include row--distributed;
  position: relative;
  width: 100%;
  height: 40px;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
}

.imagezone__file__cell__container__thumb {
  width: calc(33% - 3px);
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100%;
    margin: auto;
    object-fit: cover;
  }
}

.imagezone__file__cell__container__details {
  @include row;
  height: calc(100% - 60px);
  padding: 10px;
  background: $colorWhite;
  border-radius: 0 0 10px 10px;
}

.imagezone__file__cell__container__details__texts {
  @include col--distributed;
  width: calc(100% - 35px);
  margin-left: 5px;
}

.imagezone__file__cell__container__details__content {
  @include typography(md, default);
  line-height: 18px;
  color: $colorSecondaryLight;
  margin-bottom: 0;
}

.imagezone__dropzone__space {
  width: 100%;
  height: 0;
  position: relative;

  @include respondFrom(xl) {
    height: 90px;
  }
}

.imagezone--white {
  .imagezone__images__dialog {
    background: $colorWhite;
  }
}

</style>
