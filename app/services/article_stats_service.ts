import { ArticleStatus } from '#enums/article_status'
import Article from '#models/article'

export default class ArticleStatsService {
  static async getStats(userId?: number, isAdmin: boolean = false) {
    const publishedQuery = Article.query().where('status', ArticleStatus.PUBLISHED)
    const draftQuery = Article.query().where('status', ArticleStatus.DRAFT)
    const bannedQuery = Article.query().where('status', ArticleStatus.BANNED)

    // Pour les admins, published = tous les articles publiés (pas de filtre userId)
    // Pour les membres, filtrer tous les comptes par userId
    if (userId && !isAdmin) {
      publishedQuery.where('author_id', userId)
      draftQuery.where('author_id', userId)
      bannedQuery.where('author_id', userId)
    } else if (userId && isAdmin) {
      // Admin: published = tous, mais draft/banned = uniquement les siens
      draftQuery.where('author_id', userId)
      bannedQuery.where('author_id', userId)
    }

    const publishedResult = await publishedQuery.count('* as total')
    const draftResult = await draftQuery.count('* as total')
    const bannedResult = await bannedQuery.count('* as total')

    return {
      published: Number(publishedResult[0].$extras.total),
      drafts: Number(draftResult[0].$extras.total),
      banned: Number(bannedResult[0].$extras.total),
    }
  }
}
