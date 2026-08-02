<script setup lang="ts">
import logoUrl from '~/assets/logo.jpeg'

definePageMeta({
  layout: 'auth',
})

const { fetch } = useUserSession()

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
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
  <div class="w-full max-w-md">
    <div class="rounded-3xl border border-white/30 bg-white/95 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/95">
      <div class="mb-8 text-center">
        <img
          :src="logoUrl"
          alt="Logo Rental PS"
          class="mx-auto mb-5 size-24 rounded-full object-cover shadow-lg ring-4 ring-white/60 dark:ring-white/10"
        >
        <h1 class="text-2xl font-bold">Sistem Informasi Rental PS</h1>
        <p class="mt-1.5 text-sm text-muted">Masuk untuk mengelola operasional</p>
      </div>

      <UForm :state="form" class="space-y-4" @submit="onSubmit">
        <UFormField label="Username" name="username" required>
          <UInput v-model="form.username" placeholder="admin" size="lg" autocomplete="username" class="w-full">
            <template #leading>
              <UIcon name="i-lucide-user" class="size-4" />
            </template>
          </UInput>
        </UFormField>

        <UFormField label="Password" name="password" required>
          <UInput
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            size="lg"
            autocomplete="current-password"
            class="w-full"
          >
            <template #leading>
              <UIcon name="i-lucide-lock" class="size-4" />
            </template>
            <template #trailing>
              <UButton
                variant="link"
                color="neutral"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                aria-label="Tampilkan password"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UAlert v-if="error" color="error" variant="subtle" :title="error" :icon="null" />

        <UButton type="submit" block size="lg" :loading="loading">
          Masuk
        </UButton>
      </UForm>

      <div class="mt-6 flex items-center justify-center gap-2 text-xs">
        <span class="text-muted">Akun demo:</span>
        <UButton
          size="xs"
          variant="soft"
          icon="i-lucide-user"
          @click="form.username = 'admin'; form.password = 'admin123'"
        >
          admin / admin123
        </UButton>
        <UButton
          size="xs"
          variant="soft"
          icon="i-lucide-user"
          @click="form.username = 'kasir'; form.password = 'kasir123'"
        >
          kasir / kasir123
        </UButton>
      </div>
    </div>
  </div>
</template>
