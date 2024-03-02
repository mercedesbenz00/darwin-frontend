/**
 * Default stub for the <toggle-button> component
 *
 * Renders the TopBar Toggle Button
 */
export const ToggleButton = {
  template: `
    <div class="toggle-button-stub">
      <button class="toggle-button" @click="$emit('toggle')">
        <slot />
      </button>

      <div class="popover">
        <slot name="tooltip" />
      </div>
    </div>
  `
}
