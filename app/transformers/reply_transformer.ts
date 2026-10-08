import type Reply from '#models/reply'
import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from '#transformers/user_transformer'

export default class ReplyTransformer extends BaseTransformer<Reply> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'body',
        'bodyHtml',
        'threadId',
        'discussionId',
        'articleId',
        'createdAt',
        'updatedAt',
      ]),
      likesCount: Number(this.resource.$extras.likes_count ?? 0),
      likedByMe: Boolean(this.resource.$extras.liked_by_me),
      author: UserTransformer.transform(this.whenLoaded(this.resource.author)),
    }
  }
}
