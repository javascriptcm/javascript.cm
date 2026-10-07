import type Discussion from '#models/discussion'
import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from '#transformers/user_transformer'
import TagTransformer from '#transformers/tag_transformer'
import { plainExcerpt } from '#services/markdown'

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

  /**
   * Discussions index rows: excerpt + the latest people who replied
   * (attached by the controller in `$extras.participants`, batched).
   */
  forList() {
    const participants = (this.resource.$extras.participants ?? []) as User[]
    return {
      ...this.toObject(),
      excerpt: plainExcerpt(this.resource.body, 200),
      participants: UserTransformer.transform(participants),
      participantsCount: Number(this.resource.$extras.participants_count ?? 1),
    }
  }

  forDetail() {
    return {
      ...this.toObject(),
      bodyHtml: this.resource.bodyHtml,
      excerpt: plainExcerpt(this.resource.body, 160),
    }
  }

  forEdit() {
    return {
      ...this.toObject(),
      body: this.resource.body,
    }
  }
}
