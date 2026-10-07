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
}
