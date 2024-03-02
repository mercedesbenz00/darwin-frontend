type Counts = { training: number, validation: number, test: number }

export const getTrainingCounts = (total: number | null): Counts => {
  if (total === null) { return { training: 0, validation: 0, test: 0 } }
  if (total < 3) { return { training: total, validation: 0, test: 0 } }

  const validation = Math.max(Math.floor(total * 0.1), 1)
  const test = Math.max(Math.floor(total * 0.1), 1)
  const training = total - validation - test

  return { training, validation, test }
}
