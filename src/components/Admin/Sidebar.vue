<template>
  <div class="sidebar">
    <router-link
      class="sidebar__link"
      exact-active-class="sidebar__link--active"
      :to="{ name: 'DatasetsIndex' }"
    >
      Homepage
    </router-link>
    <router-link
      class="sidebar__link"
      exact-active-class="sidebar__link--active"
      to="/admin/teams"
    >
      Teams
    </router-link>
    <router-link
      class="sidebar__link"
      exact-active-class="sidebar__link--active"
      to="/admin/invitations"
    >
      Team Owner Invitations
    </router-link>
    <a 
      href="/super_admin"
      class="sidebar__link"
    >
      Super admin
    </a>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({ name: 'sidebar' })
export default class Sidebar extends Vue { }
</script>

<style lang="scss" scoped>
.sidebar {
  width: 20%;
  height: 100%;
  padding-top: 50px;
  background: $colorSecondaryLight3;
}

.sidebar__link {
  display: block;
  font-weight: bold;
  padding: 20px;
}

.sidebar__link:hover {
  background-color: $colorSecondaryLight4;
}

.sidebar__link--active {
  background-color: $colorSecondaryLight2;
}
</style>
