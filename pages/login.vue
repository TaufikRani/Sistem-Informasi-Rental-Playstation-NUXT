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

<template>
  <div class="flex min-h-svh items-center justify-center p-4">
    <UCard class="w-full max-w-sm" :ui="{ body: 'p-8' }">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white">
          PS
        </div>
        <h1 class="text-xl font-bold">Sistem Informasi Rental PS</h1>
        <p class="mt-1 text-sm text-muted">Masuk untuk mengelola operasional</p>
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
