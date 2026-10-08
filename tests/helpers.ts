import User from '#models/user'
import Channel from '#models/channel'

let counter = 0

/**
 * Create a member (or moderator/admin) with a unique username.
 */
export async function createUser(overrides: Partial<User> = {}) {
  counter++
  return User.create({
    username: `membre-${counter}`,
    name: `Membre ${counter}`,
    email: `membre-${counter}@example.test`,
    password: 'motdepasse-solide',
    role: 'member',
    ...overrides,
  })
}

export async function firstChannel() {
  return Channel.query().orderBy('position').firstOrFail()
}

export const LONG_BODY =
  'Voici un contenu suffisamment long pour passer la validation. '.repeat(4) +
  '\n\n```js\nconsole.log("ok")\n```\n'
