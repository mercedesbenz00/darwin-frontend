export enum SliderVariant {
  DEFAULT = 'default',
  STEPS = 'steps'
}

export interface SliderProps
  extends Omit<Partial<HTMLInputElement>, 'min' | 'max' | 'step' | 'value'> {
  variant: SliderVariant
  min: number
  max: number
  step: number
  value: number
}
