<template>
  <div class="breadcrumbs">
    <template v-for="(crumb, index) in breadCrumbs">
      <div
        v-if="crumb.slotName"
        class="breadcrumbs__link"
        :key="`div-${index}`"
      >
        <slot :name="crumb.slotName" />
      </div>
      <router-link
        v-else-if="crumb.to"
        :key="`router-link-${index}`"
        :to="crumb.to"
        class="breadcrumbs__link"
        exact-active-class="breadcrumbs__link--active"
      >
        {{ crumb.name }}
      </router-link>
      <div
        v-else
        :key="`active-${index}`"
        class="breadcrumbs__link breadcrumbs__link--active"
      >
        {{ crumb.name }}
      </div>
      <div
        v-if="index < breadCrumbs.length - 1"
        class="breadcrumbs__link"
        :key="`${index}-separator`"
      >
        /
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { useStore } from '@/composables'
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
export default defineComponent({
  name: 'BreadCrumbs',
  setup () {
    const store = useStore()
    const breadCrumbs = computed(() => store.state.ui.breadCrumbs)

    return { breadCrumbs }
  }

})
</script>

<style lang="scss" scoped>
.breadcrumbs {
  @include row;
  color: $colorContentTertiary;
  justify-content: flex-start;
  align-items: center;
}

.breadcrumbs__link {
  flex-shrink: 0;

  @include typography(md-1, inter, 500);
  color: $colorContentTertiary;
  white-space: nowrap;

  @include row;
  align-items: center;

  margin: 0 2px;

  &:last-child {
    flex-shrink: 1
  }

  &--active {
    color: $colorContentSecondary;

    &::after {
      content: '';
    }
  }
}
</style>
