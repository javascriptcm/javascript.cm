import type Tag from '#models/tag'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TagTransformer extends BaseTransformer<Tag> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'name', 'slug', 'description']),
      articlesCount: Number(this.resource.$extras.articles_count ?? 0),
      discussionsCount: Number(this.resource.$extras.discussions_count ?? 0),
    }
  }
}
