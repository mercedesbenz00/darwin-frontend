<template>
  <div
    class="read-only-dataset-card"
    :class="{'read-only-dataset-card--selected': selected}"
  >
    <div class="read-only-dataset-card__upside">
      <div class="read-only-dataset-card__upside__row read-only-dataset-card__upside__row--top">
        <div class="read-only-dataset-card__img">
          <img
            v-if="thumbnails[0]"
            v-lazy="thumbnails[0]"
          >
        </div>
        <div class="read-only-dataset-card__img">
          <img
            v-if="thumbnails[1]"
            v-lazy="thumbnails[1]"
          >
        </div>
        <div class="read-only-dataset-card__img">
          <img
            v-if="thumbnails[2]"
            v-lazy="thumbnails[2]"
          >
        </div>
      </div>
      <div class="read-only-dataset-card__upside__row">
        <div class="read-only-dataset-card__img">
          <img
            v-if="thumbnails[3]"
            v-lazy="thumbnails[3]"
          >
        </div>
        <div class="read-only-dataset-card__img">
          <img
            v-if="thumbnails[4]"
            v-lazy="thumbnails[4]"
          >
        </div>
        <div class="read-only-dataset-card__img">
          <img
            v-if="thumbnails[5]"
            v-lazy="thumbnails[5]"
          >
        </div>
      </div>
      <div
        v-if="data.public"
        class="read-only-dataset-card__status"
      >
        <img
          src="/static/imgs/dataset-status-open.svg"
          class="read-only-dataset-card__status-icon"
        >
        <div class="read-only-dataset-card__status-text">
          Open
        </div>
      </div>
    </div>
    <div class="read-only-dataset-card__downside">
      <div class="read-only-dataset-card__name">
        {{ data.name }}
      </div>
      <div class="read-only-dataset-card__stats">
        <div>
          <strong>{{ data.num_images + data.num_videos }}</strong> Files
        </div>
        <div>
          <strong>{{ data.num_classes }}</strong> Classes
        </div>
        <div>
          <strong>{{ data.num_annotations }}</strong> Annotations
        </div>
      </div>
    </div>
    <div
      v-tooltip="progressTooltipOptions"
      class="read-only-dataset-card__progress__bar"
    >
      <div
        class="read-only-dataset-card__progress__bar__filled"
        :style="{ width: progressPercentage + '%' }"
      />
    </div>
  </div>
</template>

<script lang = "ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { DatasetPayload } from '@/store/types'
import { TooltipOptions } from '@/types'

@Component({ name: 'read-only-read-only-dataset-card' })
export default class ReadOnlyDatasetCard extends Vue {
  @Prop({ required: true })
  data!: DatasetPayload

  @Prop({ required: false, default: false, type: Boolean })
  selected!: boolean

  get progressPercentage (): number {
    return Math.round((this.data.progress || 0) * 100)
  }

  get progressTooltip (): string {
    const {
      num_images: images,
      num_videos: videos,
      num_classes: classes,
      num_annotations: annotations
    } = this.data
    if (!images || !videos) { return '' }
    return `${images + videos} Files, ${classes} Classes, ${annotations} Annotations`
  }

  get progressTooltipOptions (): TooltipOptions {
    return {
      content: this.progressTooltip,
      placement: 'top',
      delay: { show: 300 },
      classes: 'tooltip--read-only-dataset-card'
    }
  }

  get thumbnails (): string[] {
    return this.data.thumbnails ? this.data.thumbnails : []
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--read-only-dataset-card {
  &[x-placement^="top"] {
    margin-bottom: 7px;
  }
}
</style>

<style lang="scss" scoped>
.read-only-dataset-card {
  height: 270px;
  border-radius: $border-radius-default;
  background: white;
  position: relative;
  display: inline-block;
  cursor: pointer;

  &:hover {
    .read-only-dataset-card__overlay {
      display: flex;
    }
  }

  &:not(:hover) {
    .read-only-dataset-card__overlay {
      display: none;
    }
  }

  .read-only-dataset-card--selected {
    .read-only-dataset-card__overlay {
      display: flex;
    }
  }
}

.read-only-dataset-card__upside {
  width: 100%;
  height: 180px;
  border-radius: $border-radius-default $border-radius-default 0 0;
  position: relative;
}

.read-only-dataset-card__upside__row {
  width: 100%;
  height: 50%;
  @include row--center;
}

.read-only-dataset-card__upside__row--top {
  border-radius: $border-radius-default $border-radius-default 0 0;
  overflow: hidden;
}

.read-only-dataset-card__img {
  flex: 1 1 auto;
  height: 100%;
  background: #FAFCFE;
}

.read-only-dataset-card__status {
  position: absolute;
  left: 0; bottom: 0;
  @include row--center;
  background: $colorWhite;
  border-radius: 0 2px 0 0;
  width: 90px;
  height: 28px;
  z-index: 999;
}

.read-only-dataset-card__status-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
.read-only-dataset-card__status-text {
  margin-left: 10px;
  @include typography(md-1, headlines, bold);
  color: $colorSecondaryLight;
}

.read-only-dataset-card__downside {
  padding: 12px 20px 12px 20px;
  position: relative;
}

.read-only-dataset-card--selected {
  .read-only-dataset-card__downside {
    background: $colorPrimaryLight2;
  }
}

.read-only-dataset-card__name {
  @include ellipsis(2, lg, 22px);
  @include typography(md-1, default, bold);
  min-height: 45px;
  max-height: 45px;
  white-space: wrap;
  color: $colorSecondaryDark;
  margin: 0 35px 0 0;
}

.read-only-dataset-card__stats {
  @include row--distributed;
  @include typography(md, default);
  line-height: 20px;

  /* Graple Light 2 */
  color: $colorSecondaryLight;

  strong {
    font-weight: bold;
    color: $colorSecondaryDark;
  }
}

.read-only-dataset-card__progress__bar {
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 0;
  height: 6px;
  background: $colorSecondaryLight2;
  border-radius: 0 0 $border-radius-default $border-radius-default;
  overflow: hidden;
}

.read-only-dataset-card__progress__bar__filled {
  position: absolute;
  bottom: 0;
  height: 6px;
  background: $colorPrimaryLight1;
  border-radius: 0 0 $border-radius-default $border-radius-default;
}
</style>
