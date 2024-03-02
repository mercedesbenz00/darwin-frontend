<template>
  <div class="hotkeys">
    <div
      v-for="category in hotkeys"
      :key="category.name"
      class="hotkeys_category"
    >
      <div class="hotkeys_category__header">
        {{ category.name }}
      </div>
      <div class="hotkeys__list-container">
        <ul
          ref="hotkeyslist"
          class="hotkeys__list"
        >
          <li
            v-for="(hotkey, idx) in category.hotkeys"
            :key="`hotkey-${idx}`"
            class="hotkeys__list-item"
          >
            <span class="hotkeys__list-item__description">{{ hotkey.description }}</span>
            <hotkey-display
              v-if="!hotkey.multi"
              :keys="hotkey.keys"
            />
            <div
              v-else
              class="hotkeys__list-item__list"
            >
              <div
                v-for="(subhotkey, jdx) of hotkey.keys"
                :key="`subhotkey-${idx}-${jdx}`"
                class="hotkeys__list-item__subhotkeys"
              >
                <span
                  v-if="jdx > 0"
                  class="hotkeys__list-item__subhotkey__or"
                >or</span>
                <hotkey-display :keys="subhotkey.keys" />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import HotkeyDisplay from './HotkeyDisplay.vue'
import { HotkeyCategory } from './types'

/**
 * Used to render hotkey informations both in the instructions sidebar, where
 * only a list of classes and a link to show full instructions is shown, as well
 * as in the modal that opens automatically, or when clicking the "Show full
 * instructions" link, where both the classes and the full instructions html
 * are shown.
 */
@Component({ name: 'hotkey-info', components: { HotkeyDisplay } })
export default class HotkeyInfo extends Vue {
  @Prop({ required: true })
  hotkeys!: HotkeyCategory[]
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.hotkeys {
  @include typography(md, default);
  @include col;
  overflow: auto;
}

.hotkeys_category {
  width: 100%;
  padding: 10px 0;
}

.hotkeys_category__header {
  @include typography(lg-1, default, bold);
  padding: 0 20px;
  color: $colorSecondaryDark1;
}

.hotkeys__list-container {
  overflow: auto;
  padding: 10px 0;
}

.hotkeys__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hotkeys__list-item {
  @include row--distributed--center;
  overflow: hidden;
  padding: 5px 20px;

  &:nth-child(odd) {
    background-color: $colorWhite;
  }
  &:nth-child(even) {
    background-color: $colorLineGrey;
  }
}

.hotkeys__list-item__description {
  @include typography(md-1);
  color: $colorSecondaryDark1;
}

.hotkeys__list-item__list {
  @include row;
}

.hotkeys__list-item__subhotkeys {
  @include row;
  align-items: center;
}

.hotkeys__list-item__subhotkey__or {
  @include typography(md-1, default, bold);
  color: $colorSecondaryLight;
  margin: 0 5px;
}
</style>
