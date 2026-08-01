export default defineNuxtRouteMiddleware((to) => {
  const user = useUserSession().user.value
  if (!user && to.path !== '/login') {
    return navigateTo('/login')
  }
  if (user && to.path === '/login') {
    return navigateTo('/')
  }
})
