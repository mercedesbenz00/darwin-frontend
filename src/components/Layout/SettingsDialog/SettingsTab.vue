<template>
  <div
    class="settings-tab"
    :class="{'settings-tab--active': active}"
    @click="$emit('click')"
  >
    <div class="settings-tab__icon">
      <slot />
    </div>
    <div class="settings-tab__title">
      {{ title }}
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'settings-tab' })
export default class SettingsTab extends Vue {
  @Prop({ required: true })
  title!: string

  @Prop({ required: false, default: false, type: Boolean })
  active!: boolean
}
</script>

<style lang="scss" scoped>
.settings-tab {
  @include row;
  padding: 8px 8px 8px 24px;
  align-items: center;
  cursor: pointer;
  transition: all .2s;
}

.settings-tab__icon {
  @include noSelect;
  width: 24px;
  height: 24px;
  @include col--center;
  margin-right: 14px;
}

.settings-tab__title {
  @include noSelect;
  @include ellipsis(1, md-1);
  flex: 1;
  @include typography(md-1, default, bold);
  color: $colorAliceBlue;
}

.settings-tab:not(.settings-tab--active):hover {
  background: rgba(145, 169, 192, 0.2);
}

.settings-tab--active,
.settings-tab:active {
  background: rgba(145, 169, 192, 0.5);
}
</style>
