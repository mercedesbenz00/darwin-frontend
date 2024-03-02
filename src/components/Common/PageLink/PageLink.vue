<template>
  <div
    class="pl__container"
    @mouseover="onHover"
    @mouseleave="onHoverLeave"
  >
    <div class="pl__wrapper">
      <router-link
        class="pl__label"
        :to="href"
      >
        {{ label }}
      </router-link>
      <div
        class="pl-icon__wrapper"
        v-if="hovers"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_924_38621)">
            <path
              d="M6.46441 13.5355L13.5355 6.46439M13.5355 6.46439L7.95719
                 6.38582M13.5355 6.46439L13.614 12.0427"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_924_38621">
              <rect
                width="20"
                height="20"
                fill="white"
              />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

import { PageLinkProps } from './types'

@Component({ name: 'page-link' })
export default class PageLink extends Vue {
  hovers: boolean = false

  @Prop({ required: true, type: String })
  label!: PageLinkProps['label']

  @Prop({ required: true, type: String })
  href!: PageLinkProps['href']

  onHover (): void {
    this.hovers = true
  }

  onHoverLeave (): void {
    this.hovers = false
  }
}
</script>

<style lang='scss' scoped>
.pl__container {
  transition: background-color 175ms ease-in-out;

  display: flex;
  align-items: center;

  width: 100%;
  height: 24px;

  background: transparent;
  border-radius: 4px;

  cursor: pointer;

  &:hover {
    background: $colorInteractivePrimaryDefault;

    & > div {
      & > a {
        color: $colorContentInverted;
      }
    }
  }
}

.pl__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0px 6px;
  height: 20px;
  width: 100%;

  overflow: hidden;
}

.pl-icon__wrapper {
  transition: all 175ms ease;

  display: inline-block;
  width: 20px;
  height: 20px;
}

.pl__label {
  transition: color 175ms ease-in-out;

  @include typography(md-1, inter, 500);
  @include ellipsis(1, md-1);

  color: $colorNeutralsLight900;
  text-align: center;
}
</style>
