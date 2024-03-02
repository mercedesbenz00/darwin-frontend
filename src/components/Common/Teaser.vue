<template>
  <div class="teaser">
    <img
      :src="`/static/imgs/teasers/darwin/${image}`"
      class="teaser__image"
    >
    <div
      class="teaser__label"
      :class="{ 'teaser__label--description': !!description }"
    >
      <div
        class="teaser__label__title"
        :style="textStyle"
      >
        {{ title }}
      </div>
      <div
        v-if="description"
        class="teaser__label__description"
        :style="textStyle"
        v-html="description"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'teaser' })
export default class Teaser extends Vue {
  @Prop({ required: true, type: String })
  title!: string

  @Prop({ required: true, type: String })
  image!: string

  @Prop({ required: false, type: String })
  description?: string

  @Prop({ required: false, default: 'center', type: String })
  textAlign!: string

  get textStyle () {
    return { 'text-align': this.textAlign }
  }
}
</script>

<style lang="scss" scoped>
.teaser {
  position: relative;
  width: 300px;
  height: 525px;
  background: $colorSecondaryLight3;
  border-radius: 10px 10px 0 10px;
  box-shadow: 0 20px 30px 10px rgba(145, 169, 192, 0.3);
}

.teaser__image {
  @include noSelect;
  position: absolute;
  bottom: 0;
  border-radius: 10px 10px 10px 0;
  width: 100%;
}

.teaser__label {
  @include noSelect;
  position: absolute;
  top: 67px;
  left: 47px;
  right: 48px;
  text-align: center;
  display: block;
  margin: auto;
  border-radius: 10px 10px 0 0;
  z-index: 999;
}

.teaser__label--description {
  top: 50px;
  left: 39px;
  right: 39px;
}

.teaser__label__title {
  @include typography(xxl, headlines, bold);
  color: $color90Black;
}

.teaser__label__description {
  margin-top: 26px;
  @include typography(md-1, headlines);
  color: $colorAliceNight;
}
</style>
