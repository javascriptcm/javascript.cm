import { ArticleStatus } from '#enums/article_status'
import Article from '#models/article'

export default class ArticleStatsService {
  static async getStats(userId?: number) {
    const publishedQuery = Article.query().where('status', ArticleStatus.PUBLISHED)
    const draftQuery = Article.query().where('status', ArticleStatus.DRAFT)
    const waitingQuery = Article.query().where('status', ArticleStatus.WAITING_APPROVAL)

    // Si userId est fourni, filtrer par l'auteur
    if (userId) {
      publishedQuery.where('author_id', userId)
      draftQuery.where('author_id', userId)
      waitingQuery.where('author_id', userId)
    }

    const publishedResult = await publishedQuery.count('* as total')
    const draftResult = await draftQuery.count('* as total')
    const waitingResult = await waitingQuery.count('* as total')

    return {
      published: Number(publishedResult[0].$extras.total),
      drafts: Number(draftResult[0].$extras.total),
      waiting: Number(waitingResult[0].$extras.total),
    }
  }
}
