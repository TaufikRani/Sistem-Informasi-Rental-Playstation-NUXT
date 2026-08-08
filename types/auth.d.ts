export default {}

declare module '#auth-utils' {
  interface User {
    id: number
    name: string
    username: string
    role: 'admin'
  }
}
