import { extractAllMatches } from './regex'

export const commentMentionRegex = /(\[Mention:)([0-9]+?);(.+?)\]/m

// Html matching this RegEx is being added in `Mentionable.vue#359`
export const htmlMentionRegEx =
  /<span id="([0-9]+)" class="member-mentioned">@([0-9a-zA-Z ,.'-]+?)<\/span>&nbsp;/m

export const buildMentionText = (userId: string, firstName: string): string =>
  `[Mention:${userId};${firstName}]`

export const buildMentionHtml = (userId: string, firstName: string): string =>
  `<span id="${userId}" class="member-mentioned">@${firstName}</span>&nbsp;`

export const commentToHtml = (comment: string): string => {
  const commentMatches = extractAllMatches(comment, commentMentionRegex)

  let commentHtml = comment
  commentMatches.forEach(([match, , userId, firstName]) => {
    commentHtml = commentHtml.replace(match, buildMentionHtml(userId, firstName))
  })

  return commentHtml
}

export const htmlToComment = (commentHtml: string): string => {
  const htmlMatches = extractAllMatches(commentHtml, htmlMentionRegEx)

  let comment = commentHtml

  htmlMatches.forEach(([match, userId, firstName]) => {
    comment = comment.replace(match, buildMentionText(userId, firstName))
  })

  return comment
}
