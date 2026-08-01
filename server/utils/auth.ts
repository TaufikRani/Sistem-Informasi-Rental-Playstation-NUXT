import { createHash, timingSafeEqual } from 'node:crypto'

const SALT = 'rentalps'

export function hashUserPassword(password: string) {
  return 'sha256:' + createHash('sha256').update(SALT + password).digest('hex')
}

export function verifyUserPassword(password: string, hash: string) {
  try {
    const expected = createHash('sha256').update(SALT + password).digest('hex')
    const stored = hash.startsWith('sha256:') ? hash.slice(7) : hash
    const a = Buffer.from(expected)
    const b = Buffer.from(stored)
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}
