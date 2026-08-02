<template>
  <div class="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-4 dark:from-primary-950 dark:via-primary-900 dark:to-primary-800">
    <div class="pointer-events-none absolute -left-32 -top-32 size-80 rounded-full bg-white/15 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-40 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
    <div class="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-300/20 blur-3xl dark:bg-green-500/10" />
    <slot />
  </div>
</template>
