export async function requireUser(event: H3Event) {
  const session = await requireUserSession(event)
  return session.user
}
