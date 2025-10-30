import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { demoUsers } from '#mock-data/users'

export default class UserSeeder extends BaseSeeder {
  async run() {
    // Create a test user
    await User.createMany(demoUsers)

    console.log('✅ Users seeded successfully')
  }
}
