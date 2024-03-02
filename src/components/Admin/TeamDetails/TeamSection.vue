<template>
  <div
    class="section"
    :class="{'section--inactive': !active}"
  >
    <div class="section__title">
      <slot name="title" />
    </div>
    <div class="section__body">
      <slot name="body" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'team-section'
})
export default class TeamSection extends Vue {
  @Prop({ required: false, default: true, type: Boolean as () => boolean })
  active!: boolean
}
</script>

<style lang="scss" scoped>
.section {
  @include row;
  flex-wrap: wrap;
  margin-bottom: 25px;
  padding: 20px;
  background: $colorSecondaryLight3;
  border-radius: 3px;

}

.section .section--inactive {
  opacity: .3;
}

.section .section__title {
  width: 80%;
  margin-right: 20%;
  @include typography(xl, headlines, bold);
  margin-bottom: 10px;
}

.section .section__body {
  @include row;
  flex-wrap: wrap;

  gap: 15px;
}
</style>
