<template>
  <div class="breadcrumbs">
    <template v-for="(crumb, index) in breadCrumbs">
      <router-link
        v-if="crumb.to"
        :key="index"
        :to="crumb.to"
        class="breadcrumbs__link"
        :exact-active-class="'breadcrumbs__link--active'"
      >
        {{ crumb.name }}
      </router-link>
      <div
        v-else
        :key="index"
        class="breadcrumbs__linkless"
      >
        {{ crumb.name }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { BreadCrumb } from '@/mixins/BreadCrumbInitializer'

/**
 * Automatically renders breadcrumbs based on UI store state.
 *
 * To use this component in a section of the app, the routes used in the section
 * should each push their own breacrumb to the store on `mount`, and remove it
 * on `beforeDestroy`.
 *
 * This function is intended to replace `BreadCrumb.vue` as a more flexible
 * and testable approach to manage breadcrumbs.
 */
@Component({ name: 'bread-crumbs' })
export default class BreadCrumbs extends Vue {
  @State(state => state.ui.breadCrumbs)
  breadCrumbs!: BreadCrumb[]
}
</script>

<style lang="scss" scoped>

.breadcrumbs {
  @include row;
  justify-content: left;
  @include typography(md, default);
  color: $colorSecondaryLight;
}

.breadcrumbs__link,
.breadcrumbs__linkless {
  @include noSelect;
  color: $colorSecondaryLight;

  &::after {
    content: url('/static/imgs/chevron.svg');
    margin: 0 5px;
  }
}

.breadcrumbs__link {
  cursor: pointer;
}

.breadcrumbs__link--active {
  font-weight: bold;
  color: $colorPrimaryDark;

  &::after {
    display: none;
  }
}
</style>
