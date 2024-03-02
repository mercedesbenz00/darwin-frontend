<template>
  <div class="tabs">
    <component
      :is="tab.to ? 'router-link' : 'div'"
      v-for="tab in tabs"
      :key="tab.name"
      :to="tab.to"
      class="tabs__tab"
      :class="{ 'tabs__tab--coming': tab.coming }"
      :active-class="!tab.exact ? 'tabs__tab--active' : ''"
      :exact-active-class="tab.exact ? 'tabs__tab--active' : ''"
    >
      {{ tab.name }}
      <!-- This has been added to keep the same width for bold and normal font -->
      <div class="tabs__tab--shown">
        {{ tab.name }}
      </div>
    </component>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Tab } from './types'

@Component({ name: 'tabs' })
export default class Tabs extends Vue {
  @Prop({ required: true })
  tabs!: Tab[]
}
</script>

<style lang="scss" scoped>
.tabs {
  @include row;
}

.tabs__tab {
  @include noSelect;
  margin: 0px 17px;
  @include typography(md-1, headlines, bold);
  line-height: 20px;
  text-align: center;
  color: transparent;
  cursor: pointer;
  position: relative;

  &:first-child {
    margin-left: 0;
  }

  &:last-child:not:nth-child(2) {
    margin-right: 0;
  }
}

.tabs__tab--shown {
  position: absolute;
  @include fullsize;
  font-weight: normal;
  color: $colorSecondaryLight;

  &:hover {
    font-weight: bold;
    color: $colorSecondaryDark1;
  }
}

.tabs__tab--active {
  font-weight: bold;
  color: $colorSecondaryDark1;

  &::after {
    content: ' ';
    position: absolute;
    top: calc(100% + 6px);
    left: calc(50% - 30px);
    right: calc(50% - 30px);
    max-width: 60px;
    height: 0;
    border: 2px solid $colorSecondaryDark1;
    background: #1f1f1f;
    border-radius: 3px;
  }

  .tabs__tab--shown {
    opacity: 0;
  }
}

.tabs__tab--coming {
  color: $colorGrayLite;
  font-weight: normal;

  &::before {
    content: 'COMING SOON';
    position: absolute;
    top: -13px;
    left: 0;
    right: 0;
    @include typography(xs);
    letter-spacing: 0.5px;
    text-align: center;
    font-weight: bold;
    color: $colorPrimaryLight1;
  }

  .tabs__tab--shown {
    opacity: 0;
    color: $colorGrayLite;
  }
}
</style>
