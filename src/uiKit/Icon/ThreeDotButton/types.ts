export enum DotButtonSize {
  SMALL = 'small',
  LARGE = 'large'
}

export interface ThreeDotButtonProps extends HTMLButtonElement {
  size?: DotButtonSize
}
