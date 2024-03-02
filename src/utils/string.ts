export const findClosingBracketIndex = (text: string, pos: number): number => {
  if (text[pos] !== '[') {
    throw new Error('The position must contain an opening bracket')
  }

  let level = 1
  for (let index = pos + 1; index < text.length; index++) {
    if (text[index] === '[') {
      level++
    } else if (text[index] === ']') {
      level--
    }

    if (level === 0) {
      return index
    }
  }
  return -1
}

/**
 * Returns company url from company email
 */
export const getCompanyUrlFromEmail = (email: string): string | null => {
  if (!email.includes('@')) { return null }
  return email.split('@').pop() || null
}

/**
* function that appends a number at the end of the string
* if the string already ends with a number it will increment the number
* otherwise it will append a (1)
* appendNumber('foo', ['foo']) -> 'foo (1)'
* appendNumber('foo', []) -> 'foo'
* appendNumber('foo (1)', ['foo', 'foo (1)']) -> 'foo (2)'
* appendNumber('foo (1)', ['foo', 'foo (1)', 'foo (2)']) -> 'foo (3)'
* appendNumber('foo (1)', ['foo (5)', 'foo', 'foo (1)']) -> 'foo (6)'
*/
export const appendNumber = (str: string | undefined, others: string[]): string | undefined => {
  if (str === undefined) { return undefined }
  if (!others.includes(str)) { return str }
  const reg = / \((\d+)\)$/
  const match = str.match(reg)
  if (match) {
    const maxNumberFound = Math.max(parseInt(match[1]), ...others.filter(
      other => other.indexOf(str.replace(reg, '')) === 0
    ).map(other => parseInt(other.match(reg)?.[1] ?? '1')))
    return str.replace(reg, (` (${maxNumberFound + 1})`))
  }
  const newName = str + ' (1)'
  if (others.includes(newName)) {
    return appendNumber(newName, others)
  }
  return newName
}

/**
 * From a string return a number value
 */
export const encodeString = (value: string): number => {
  let encode = ''
  for (let i = 0; i < value.length; i++) {
    const x = value.slice(i, i + 1)
    encode += x.charCodeAt(0)
  }
  return Number.isFinite(Number(encode)) ? Number(encode) : 0
}
