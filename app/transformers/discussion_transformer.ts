import type Discussion from '#models/discussion'
import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from '#transformers/user_transformer'
import TagTransformer from '#transformers/tag_transformer'

export default class DiscussionTransformer extends BaseTransformer<Discussion> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'title',
        'slug',
        'viewsCount',
        'repliesCount',
        'pinnedAt',
        'lockedAt',
        'lastActivityAt',
        'createdAt',
        'updatedAt',
      ]),
      author: UserTransformer.transform(this.whenLoaded(this.resource.author)),
      tags: TagTransformer.transform(this.whenLoaded(this.resource.tags)),
    }
  }

  forDetail() {
    return {
      ...this.toObject(),
      bodyHtml: this.resource.bodyHtml,
    }
  }

  forEdit() {
    return {
      ...this.toObject(),
      body: this.resource.body,
    }
  }
}
