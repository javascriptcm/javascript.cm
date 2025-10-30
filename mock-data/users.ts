import { Role } from '#enums/role'

export const demoUsers = [
  {
    username: 'admin',
    name: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: Role.ADMIN,
  },
  {
    username: 'regularuser',
    name: 'Regular User',
    email: 'regular@example.com',
    password: 'password123',
    role: Role.MEMBER,
  },
]
