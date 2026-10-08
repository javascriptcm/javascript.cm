import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  /**
   * Public, minimal representation (author bylines, avatars).
   */
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'username', 'name', 'avatarUrl', 'role']),
      displayName: this.resource.displayName,
      initials: this.resource.initials,
    }
  }

  /**
   * Public profile page.
   */
  forProfile() {
    return {
      ...this.toObject(),
      ...this.pick(this.resource, [
        'bio',
        'location',
        'websiteUrl',
        'githubUsername',
        'twitterUsername',
        'linkedinUsername',
        'createdAt',
      ]),
    }
  }

  /**
   * The signed-in user (shared with every page). Includes private fields.
   */
  forSession() {
    return {
      ...this.forProfile(),
      email: this.resource.email,
      hasPassword: this.resource.password !== null,
      isAdmin: this.resource.isAdmin,
      isModerator: this.resource.isModerator,
    }
  }

  /**
   * Members directory row. Counters come from subqueries selected as
   * "articles_count", "threads_count" and "replies_count".
   */
  forDirectory() {
    return {
      ...this.toObject(),
      ...this.pick(this.resource, ['bio', 'location', 'createdAt']),
      articlesCount: Number(this.resource.$extras.articles_count ?? 0),
      threadsCount: Number(this.resource.$extras.threads_count ?? 0),
      repliesCount: Number(this.resource.$extras.replies_count ?? 0),
    }
  }

  /**
   * Back-office row for moderators (no private contact data).
   */
  forModeration() {
    return {
      ...this.forDirectory(),
      bannedAt: this.resource.bannedAt,
      isBanned: this.resource.isBanned,
    }
  }

  /**
   * Back-office row for administrators: adds the e-mail address.
   */
  forAdmin() {
    return {
      ...this.forModeration(),
      email: this.resource.email,
    }
  }
}
