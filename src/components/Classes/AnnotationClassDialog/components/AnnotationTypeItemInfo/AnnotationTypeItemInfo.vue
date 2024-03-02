<template>
  <v-popover
    trigger="hover"
    offset="5"
    placement="right"
    popover-class="popover--annotation-type-info"
    :open.sync="active"
  >
    <div
      class="info"
      :class="{ 'info--active': active }"
    >
      <info-icon />
    </div>
    <template #popover>
      <div class="annotation-type-info">
        <div class="annotation-type-info__image">
          <img :src="iconData">
        </div>
        <div class="annotation-type-info__details">
          <div class="annotation-type-info__title">
            {{ data.title }}
          </div>
          <div class="annotation-type-info__description">
            {{ data.description }}
          </div>
          <div
            v-if="data.pros && data.pros.length > 0"
            class="annotation-type-info__section"
          >
            <div class="annotation-type-info__sub-title">
              Good for:
            </div>
            <ul class="annotation-type-info__items">
              <li
                v-for="(item, index) of data.pros"
                :key="`pros-${index}`"
                class="annotation-type-info__item"
              >
                {{ item }}
              </li>
            </ul>
          </div>
          <div
            v-if="data.cons && data.cons.length > 0"
            class="annotation-type-info__section"
          >
            <div class="annotation-type-info__sub-title">
              Bad for:
            </div>
            <ul class="annotation-type-info__items">
              <li
                v-for="(item, index) of data.cons"
                :key="`cons-${index}`"
                class="annotation-type-info__item"
              >
                {{ item }}
              </li>
            </ul>
          </div>
          <div
            v-if="data.features && data.features.length > 0"
            class="annotation-type-info__section"
          >
            <div class="annotation-type-info__sub-title">
              Allows you to train the following model types:
            </div>
            <ul class="annotation-type-info__items">
              <li
                v-for="(item, index) of data.features"
                :key="`features-${index}`"
                class="annotation-type-info__item"
              >
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { InfoIcon } from '@/assets/icons/V1'
import { AnnotationTypeRichPayload } from '@/utils'

@Component({
  name: 'annotation-type-item-info',
  components: { InfoIcon }
})
export default class AnnotationTypeItemInfo extends Vue {
  @Prop({ required: true })
  data!: AnnotationTypeRichPayload

  active: boolean = false

  get iconData () {
    return require(`./assets/${this.data.name}.png`)
  }
}
</script>

<style lang="scss" scoped>
.info {
  @include info-icon;
}

.annotation-type-info {
  @include row;
}

.annotation-type-info__image {
  margin-top: 10px;

  img {
    width: 150px;
    height: 150px;
    object-fit: contain;
  }
}

.annotation-type-info__details {
  padding: 20px 15px 20px 0;
  color: $colorWhite;
}

.annotation-type-info__title {
  @include typography(md-1, default, bold);
  margin-bottom: 15px;
}

.annotation-type-info__description {
  @include typography(md);
  margin-bottom: 15px;
  text-align: justify;
}

.annotation-type-info__section {
  @include col;
  margin-bottom: 15px;
}

.annotation-type-info__sub-title {
  @include typography(xs);
  margin-bottom: 5px;
}

.annotation-type-info__items {
  padding-inline-start: 0;
  margin-block-start: 0;
  margin-block-end: 0;
}

.annotation-type-info__item {
  @include typography(md);
  text-align: justify;
  list-style-position: inside;
  list-style-type: "- ";
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popover--annotation-type-info {
  border-radius: 5px;
  background: rgba(32, 32, 32, 0.7);

  .popover-inner {
    background: rgba(32, 32, 32, 0.7);
    border-radius: 5px;
    width: 450px;
    max-width: 450px;
    overflow: hidden;
    padding: 0;
  }

  .popover-arrow {
    left: -5px !important;
    transform: none;
  }
}
</style>
