export enum ButtonIconPosition {
  LEFT = 'left',
  RIGHT = 'right',
  BOTH = 'both',
  NONE = 'none'
}

export function getIconPosition (hasPrefix: boolean, hasSuffix: boolean): ButtonIconPosition {
  const hasBoth = hasSuffix && hasPrefix
  const hasNone = !hasSuffix && !hasPrefix

  if (hasBoth) {
    return ButtonIconPosition.BOTH
  } else if (hasNone) {
    return ButtonIconPosition.NONE
  } else if (hasSuffix) {
    return ButtonIconPosition.RIGHT
  }

  return ButtonIconPosition.LEFT
}
