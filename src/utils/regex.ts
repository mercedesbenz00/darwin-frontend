export const replaceableRegex = (key: string): RegExp => new RegExp(`(\\[${key}:)(.*?)\\]`, 'm')

export const extractAllMatches = (text: string, regEx: RegExp): RegExpExecArray[] => {
  const matches: RegExpExecArray[] = []

  let start = 0
  while (start <= text.length) {
    const execResult = regEx.exec(text.substr(start))
    if (!execResult) { break }

    start += execResult[0].length
    matches.push(execResult)
  }

  return matches
}

type Location = {
  href: string
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
}

/**
 * checks if a string is a valid url
 * @param str the string to be checked
 * @returns true if it's a valid url
 */
export const validUrl = (str: string): boolean => {
  const regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-/]))?/
  return regex.test(str)
}

export const getLocation = (href: string): Location => {
  const match = href.match(
    /^(https?:)\/\/(([^:/?#]*)(?::([0-9]+))?)([/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/
  )
  return {
    href,
    protocol: match ? match[1] : '',
    host: match ? match[2] : '',
    hostname: match ? match[3] : '',
    port: match ? match[4] : '',
    pathname: match ? match[5] : '',
    search: match ? match[6] : '',
    hash: match ? match[7] : ''
  }
}
