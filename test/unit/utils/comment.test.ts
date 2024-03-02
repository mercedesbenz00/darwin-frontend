import {
  buildMentionHtml,
  buildMentionText,
  commentToHtml,
  htmlToComment
} from '@/utils/comment'

describe('buildMentionHtml', () => {
  it('builds comment mention html', () => {
    const html = buildMentionHtml('1', 'test')
    expect(html).toContain('id="1"')
    expect(html).toContain('class="member-mentioned"')
    expect(html).toContain('@test')
  })
})

describe('buildMentionText', () => {
  it('builds comment mention text', () => {
    const text = buildMentionText('1', 'test')
    expect(text).toEqual('[Mention:1;test]')
  })
})

describe('commentToHtml', () => {
  it('converts comment text to html', () => {
    const html = commentToHtml('[Mention:1;test] after')
    expect(html).toEqual('<span id="1" class="member-mentioned">@test</span>&nbsp; after')
  })

  it('converts comment text to html when there are 2 mentions', () => {
    const html = commentToHtml('[Mention:1;test] after [Mention:2;v7]')
    expect(html).toEqual('<span id="1" class="member-mentioned">@test</span>&nbsp; after <span id="2" class="member-mentioned">@v7</span>&nbsp;')
  })
})

describe('htmlToComment', () => {
  it('converts html to comment text', () => {
    const html = htmlToComment('<span id="1" class="member-mentioned">@test</span>&nbsp; after')
    expect(html).toEqual('[Mention:1;test] after')
  })

  it('converts html to comment text when there are 2 mentions', () => {
    const html = htmlToComment('<span id="1" class="member-mentioned">@test</span>&nbsp; after <span id="2" class="member-mentioned">@v7</span>&nbsp;')
    expect(html).toEqual('[Mention:1;test] after [Mention:2;v7]')
  })
})
