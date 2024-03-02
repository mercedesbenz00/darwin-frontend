import { extractAllMatches, replaceableRegex } from '@/utils/regex'

describe('extractAllMatches', () => {
  it('extracts all matching with regex', () => {
    const text = '[Mention:1;test] after [Mention:2;v7]'
    const regex = /(\[Mention:)([0-9]+?);(.+?)\]/m
    const matches = extractAllMatches(text, regex)
    expect(matches).toHaveLength(2)
    expect(matches[0]).toHaveLength(4)
    expect(matches[0][0]).toEqual('[Mention:1;test]')
    expect(matches[0][1]).toEqual('[Mention:')
    expect(matches[0][2]).toEqual('1')
    expect(matches[0][3]).toEqual('test')
    expect(matches[1]).toHaveLength(4)
    expect(matches[1][0]).toEqual('[Mention:2;v7]')
    expect(matches[1][1]).toEqual('[Mention:')
    expect(matches[1][2]).toEqual('2')
    expect(matches[1][3]).toEqual('v7')
  })
})

describe('replaceableRegex', () => {
  it('returns replaceable regex', () => {
    const regex = replaceableRegex('User')
    expect(regex.source).toEqual('(\\[User:)(.*?)\\]')
  })
})
