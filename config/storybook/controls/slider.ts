export const slider = (min: number = 0, max: number = 1000, step: number = 1) => ({
  control: { type: 'range', min, max, step }
})
