import { hashPassword } from '@/utils/hash'
import prisma from '@/utils/prisma'

import { CreateUserInput, UpdateUserBodyParams } from '@/http/modules/user/user.schema'

export async function createUser(input: CreateUserInput) {
  const { password, ...rest } = input

  const { hash } = await hashPassword(password)

  const user = await prisma.tab_users.create({
    data: { ...rest, password: hash },
  })

  return user
}

export async function findUserByUsername(username: string) {
  return prisma.tab_users.findUnique({
    where: {
      username,
    },
  })
}

export async function findUserById(user_id: number) {
  return prisma.tab_users.findUnique({
    where: {
      user_id,
    },
    select: {
      user_id: true,
      username: true,
      full_name: true,
      email: true,
      phone: true,
      profile_picture: true,
      user_type: true,
      created_at: true,
      updated_at: true,
    },
  })
}
