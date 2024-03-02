<template>
  <div class="model-stat">
    <h1 class="model-stat__title">
      {{ name }}
    </h1>
    <div
      v-if="score"
      class="model-stat__content model-stat__three_cols"
    >
      <div class="model-stat__content__score">
        {{ score }}
      </div>
      <div class="model-stat__content__hero">
        <slot name="hero" />
      </div>
      <div class="model-stat__content__description">
        <slot name="description" />
      </div>
    </div>
    <div
      v-else
      class="model-stat__content model-stat__two_cols"
    >
      <div class="model-stat__content__hero">
        <slot name="hero" />
      </div>
      <div class="model-stat__content__description">
        <slot name="description" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({ name: 'model-stat' })
export default class ModelStat extends Vue {
  @Prop({ required: true, type: String })
  name!: string

  @Prop({ required: false })
  score!: string | undefined
}
</script>

<style lang="scss" scoped>
.model-stat__title {
  @include typography(lg, default, bold);
  margin-bottom: 10px;
}

.model-stat__content {
  display: grid;
  grid-template-rows: auto;
  align-items: center;
  justify-items: left;
}

.model-stat__content__hero svg {
  width: 85%;
}

.model-stat__three_cols {
  grid-template-columns: 15% 15% 70%;
}

.model-stat__two_cols {
  grid-template-columns: 20% 80%;
}

.model-stat__content__score {
  @include typography(xl-2, default, bold);
  font-size: 1.5vw;
}
</style>
