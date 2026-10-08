import type Channel from '#models/channel'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ChannelTransformer extends BaseTransformer<Channel> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'name', 'slug', 'description']),
      threadsCount: Number(this.resource.$extras.threads_count ?? 0),
    }
  }
}
