import type Thread from '#models/thread'
import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from '#transformers/user_transformer'
import ChannelTransformer from '#transformers/channel_transformer'
import { plainExcerpt } from '#services/markdown'

export default class ThreadTransformer extends BaseTransformer<Thread> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'title',
        'slug',
        'viewsCount',
        'repliesCount',
        'solutionReplyId',
        'pinnedAt',
        'lockedAt',
        'lastActivityAt',
        'createdAt',
        'updatedAt',
      ]),
      isSolved: this.resource.isSolved,
      author: UserTransformer.transform(this.whenLoaded(this.resource.author)),
      channel: ChannelTransformer.transform(this.whenLoaded(this.resource.channel)),
    }
  }

  /**
   * Forum index rows: adds a short plain-text excerpt of the question.
   */
  forList() {
    return {
      ...this.toObject(),
      excerpt: plainExcerpt(this.resource.body, 170),
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
      channelId: this.resource.channelId,
    }
  }
}
