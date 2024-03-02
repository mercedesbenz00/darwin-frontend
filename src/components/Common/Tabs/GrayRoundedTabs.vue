<template>
  <div class="tabs">
    <div
      v-for="(tab, index) of tabs"
      :key="index"
      class="tabs__tab"
      :class="{ 'tabs__tab--active': currentTab === tab }"
      @click="$emit('update:current-tab', tab)"
    >
      {{ tab }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'gray-rounded-tabs' })
export default class GrayRoundedTabs extends Vue {
  @Prop({ required: true })
  currentTab!: string

  @Prop({ required: true })
  tabs!: string[]
}
</script>

<style lang="scss" scoped>
.tabs {
  @include row--center;
  background: $colorAliceShade;
  box-shadow: inset 0px 2px 10px rgba(145, 169, 192, 0.3);
  border-radius: 3px;
}

.tabs__tab {
  @include row--center;
  @include typography(md-1);
  color: $colorAliceNight;
  text-transform: uppercase;
  padding: 3px 25px;
  cursor: pointer;
  transition: all 0.1s ease-in-out;
}

.tabs__tab--active {
  @include row--center;
  @include typography(md-1, default, bold);
  background: $colorAliceNight;
  color: white;
  box-shadow: 0px 10px 10px rgba(145, 169, 192, 0.3), inset 0px 4px 10px rgba(241, 245, 249, 0.19);
  transform: scale(1.1);
  border-radius: 5px;
}
</style>
