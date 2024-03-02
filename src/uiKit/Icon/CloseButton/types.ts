export enum CloseButtonSize {
  SMALL = 'small',
  LARGE = 'large'
}

export interface CloseButtonProps extends HTMLButtonElement {
  size?: CloseButtonSize
}
