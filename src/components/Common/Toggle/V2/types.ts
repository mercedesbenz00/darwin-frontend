export type ToggleProps = {
  disabled?: boolean,
  position?: TogglePosition
  size?: ToggleSize
  value?: boolean
}

export enum TogglePosition {
  START = 'start',
  END = 'end'
}

export enum ToggleSize {
  SMALL = 'small',
  LARGE = 'large'
}
