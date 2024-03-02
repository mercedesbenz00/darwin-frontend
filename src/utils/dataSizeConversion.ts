const BYTES_IN = {
  KB: 1000,
  MB: 1000 * 1000,
  GB: 1000 * 1000 * 1000,
  TB: 1000 * 1000 * 1000 * 1000
}

export const fromBytes = (value: number, to: keyof typeof BYTES_IN) => value / BYTES_IN[to]
export const toBytes = (value: number, to: keyof typeof BYTES_IN) => value * BYTES_IN[to]
