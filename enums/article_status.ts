export enum ArticleStatus {
  DRAFT = 'draft',
  BANNED = 'banned',
  PUBLISHED = 'published',
}

export const ARTICLE_STATUS_LIST: ArticleStatus[] = Object.values(ArticleStatus)
