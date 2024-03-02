import { Story } from '@storybook/vue'

import DeleteButton from './DeleteButton.vue'
import MiniSecondaryLightButton from './MiniSecondaryLightButton.vue'
import NegativeButton from './NegativeButton.vue'
import PositiveButton from './PositiveButton.vue'
import PrimaryButton from './PrimaryButton.vue'
import RoundDropShadowButton from './RoundDropShadowButton.vue'
import RoundedToggleButton from './RoundedToggleButton.vue'
import SecondaryButton from './SecondaryButton.vue'
import SecondaryLightButton from './SecondaryLightButton.vue'

export default {
  title: 'Common/Button/V1'
}

export const Buttons: Story = () => ({
  components: {
    DeleteButton,
    NegativeButton,
    PositiveButton,
    PrimaryButton,
    RoundDropShadowButton,
    RoundedToggleButton,
    SecondaryButton,
    SecondaryLightButton,
    MiniSecondaryLightButton
  },
  data (): {} {
    return {
      selected: false,
      style: {
        display: 'grid',
        gap: '.5em',
        'align-items': 'center',
        'justify-content': 'start',
        'grid-template-columns': 'auto auto auto auto'
      },
      buttonStyle: {
        width: '40px',
        height: '40px'
      }
    }
  },
  template: `
    <div :style="style">
      <delete-button />
      <primary-button>Primary Positive Button</primary-button>
      <positive-button>Secondary Positive Button</positive-button>
      <negative-button>Primary Negative Button</negative-button>
      <round-drop-shadow-button :style="buttonStyle">
        <span>AB</span>
      </round-drop-shadow-button>
      <rounded-toggle-button 
        :style="buttonStyle" 
        :selected="selected" 
        @toggle="selected = !selected"
      >
        Rounded toggle
      </rounded-toggle-button>
      <secondary-button>Secondary Button</secondary-button>
      <secondary-light-button>Secondary Light Button</secondary-light-button>
      <mini-secondary-light-button>Mini Secondary Light Button</mini-secondary-light-button>
    </div>
  `
})
