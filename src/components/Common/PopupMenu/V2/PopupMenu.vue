<template>
  <div
    class="menu__container"
    v-click-outside="(e) => $emit('click:outside', e)"
  >
    <div class="menu__wrapper">
      <slot />
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component({ name: 'PopupMenuV2' })
export default class PopupMenuV2 extends Vue {
  @Prop({ default: -1, type: Number })
  seperatorIndex!: number

  mounted (): void { this.setSeperator() }

  setSeperator (): void {
    if (this.seperatorIndex === -1) { return }

    const wrapper = Array.from(this.$el.getElementsByClassName('menu__wrapper'))[0]
    const childs = Array.from(wrapper.children)
    const seperatorElement = document.createElement('div')
    seperatorElement.classList.add('list--seperator')
    childs.splice(this.seperatorIndex, 0, seperatorElement)
    childs.forEach(c => { wrapper.appendChild(c) })
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss">
.list--seperator {
  display: inline-block;
  width: calc(100% + 8px);
  height: 1px;
  background: transparent;
  margin: 4px 0px 4px -4px;

  box-shadow: $borderLightBottom;
}
</style>

<style lang='scss' scoped>
.menu__container {
  display: block;
  border-radius: 10px;
  border: 1px solid $colorNeutralsLight300;
  box-shadow: $shadowLightXS;
  width: 184px;
  height: auto;
  cursor: pointer;
  background: $colorNeutralsLightWhite;
}

.menu__wrapper {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(auto-fit, min-content);
  grid-row-gap: 2px;

  padding: 4px;
}
</style>
