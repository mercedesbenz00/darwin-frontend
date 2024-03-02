<template>
  <component
    :is="tag"
    class="settings-pane-wrapper"
  >
    <div
      v-loading="loading"
      class="settings-pane__title"
      :loading-options="{label: null, backgroundColor: 'rgba(0, 0, 0, 0)'}"
    >
      {{ title }}
    </div>
    <div class="settings-pane__body">
      <slot name="body" />
    </div>
    <div
      v-if="footer"
      class="settings-pane__footer"
    >
      <secondary-button
        class="settings-pane__cancel"
        type="button"
        @click="close"
      >
        Close
      </secondary-button>
      <slot name="footer" />
    </div>
    <slot />
  </component>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({ name: 'settings-pane' })
export default class SettingsPane extends Vue {
  @Prop({ required: true, type: String })
  title!: string

  @Prop({ required: false, default: 'div', type: String })
  tag!: string

  @Prop({ required: false, default: false, type: Boolean })
  loading!: boolean

  @Prop({ required: false, default: true, type: Boolean })
  footer!: boolean

  close () {
    this.$store.dispatch('ui/hideSettingsDialog')
  }
}
</script>

<style lang="scss" scoped>
.settings-pane-wrapper {
  @include col;
  width: 100%;
  height: 100%;
}

.settings-pane__title {
  @include typography(xl-1, default, 900);
  color: $colorSecondaryDark1;
  padding: 27px 42px;
  background: $colorSecondaryLight3;
}

.settings-pane__body {
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  padding: 45px 80px;
}

.settings-pane__footer {
  @include row;
  justify-content: flex-end;
  align-items: center;
  padding: 15px;
  background: $colorWhite;
  box-shadow: 0px 0px 10px rgba(20, 5, 60, 0.2);
  z-index: 1;
}

.settings-pane__footer .settings-pane__cancel {
  width: 180px;
  margin-right: 20px;
}

.settings-pane__footer button:not(.settings-pane__cancel) {
  width: 180px;
}
</style>
