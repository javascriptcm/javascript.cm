import type Article from '#models/article'
import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from '#transformers/user_transformer'
import TagTransformer from '#transformers/tag_transformer'

export default class ArticleTransformer extends BaseTransformer<Article> {
  /**
   * Listing representation (cards, rows).
   */
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'title',
        'slug',
        'excerpt',
        'coverUrl',
        'readingMinutes',
        'viewsCount',
        'publishedAt',
        'featuredAt',
        'createdAt',
        'updatedAt',
      ]),
      isPublished: this.resource.isPublished,
      likesCount: Number(this.resource.$extras.likes_count ?? 0),
      commentsCount: Number(this.resource.$extras.comments_count ?? 0),
      author: UserTransformer.transform(this.whenLoaded(this.resource.author)),
      tags: TagTransformer.transform(this.whenLoaded(this.resource.tags)),
    }
  }

  /**
   * Article page: rendered HTML body.
   */
  forDetail() {
    return {
      ...this.toObject(),
      bodyHtml: this.resource.bodyHtml,
    }
  }

  /**
   * Edit form: raw markdown body.
   */
  forEdit() {
    return {
      ...this.toObject(),
      body: this.resource.body,
    }
  }
}
