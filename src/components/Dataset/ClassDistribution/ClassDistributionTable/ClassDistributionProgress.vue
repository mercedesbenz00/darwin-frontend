<template>
  <div class="class-distribution-progress">
    <div
      class="class-distribution-progress__content"
      :style="{
        backgroundColor: color,
        opacity: count === 0 ? 0.3 : 0.8,
        width: `${percentage}%`
      }
      "
    />
    <label class="class-distribution-progress__count">{{ count }}</label>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'class-distribution-progress'
})
export default class ClassDistributionProgress extends Vue {
  @Prop({ required: true, type: String })
  color!: string

  @Prop({ required: true, type: Number })
  count!: number

  @Prop({ required: true, type: Number })
  maxCount!: number

  get percentage () {
    const { count, maxCount } = this
    return count / maxCount * 100
  }
}
</script>

<style lang="scss" scoped>
.class-distribution-progress {
  width: 100%;
  height: 20px;
  position: relative;
  @include row;
  align-items: center;
}

.class-distribution-progress__content {
  height: 100%;
  border-radius: 5px;
  min-width: 12px;
  filter: brightness(0.9);
  text-shadow: 0px 2px 5px rgba(0, 0, 0, 0.25);

  transition: width .2s ease;
}

.class-distribution-progress__count {
  position: absolute;
  left: 2px;
  top: 2px;
  bottom: 2px;
  @include typography(md, default, bold);
  color: $colorWhite;
  text-shadow: 0px 2px 5px rgba(0, 0, 0, 0.25);
}
</style>
