<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4">
    <UCard class="w-full max-w-sm" :ui="{ body: 'p-8' }">
      <div class="text-center mb-8">
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-bold">
          PS
        </div>
        <h1 class="text-xl font-bold text-neutral-900 dark:text-white">Sistem Informasi Rental PS</h1>
        <p class="text-sm text-neutral-500 mt-1">Masuk untuk mengelola operasional</p>
      </div>

      <UForm :state="form" class="space-y-4" @submit="onSubmit">
        <UFormField label="Username" name="username" required>
          <UInput v-model="form.username" placeholder="admin" size="lg" autocomplete="username" />
        </UFormField>
        <UFormField label="Password" name="password" required>
          <UInput v-model="form.password" type="password" placeholder="••••••••" size="lg" autocomplete="current-password" />
        </UFormField>

        <UAlert v-if="error" color="error" variant="subtle" :title="error" :icon="null" />

        <UButton type="submit" block size="lg" :loading="loading">
          Masuk
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { fetch } = useUserSession()
const loading = ref(false)
const error = ref('')
const form = reactive({ username: '', password: '' })

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: form })
    await fetch()
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Gagal masuk'
  } finally {
    loading.value = false
  }
}
</script>
