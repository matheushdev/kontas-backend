import bcrypt from 'bcryptjs'

type HashPasswordReturn = {
  hash: string
  salt: string
}

export async function hashPassword(password: string): Promise<HashPasswordReturn> {
  const salt = await bcrypt.genSalt(12)
  const hash = await bcrypt.hash(password, salt)

  return { hash, salt }
}

type VerifyPasswordReturn = boolean

export async function verifyPassword(candidatePassword: string, hash: string): Promise<VerifyPasswordReturn> {
  const isMatch = await bcrypt.compare(candidatePassword, hash)

  return isMatch
}
