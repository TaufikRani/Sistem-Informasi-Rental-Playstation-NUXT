export function useCrud<T extends { id: number }>(endpoint: string) {
  const items = ref<T[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const toast = useToast()

  async function fetchItems() {
    loading.value = true
    try {
      items.value = await $fetch<T[]>(endpoint)
    } finally {
      loading.value = false
    }
  }

  function getErrorMessage(e: any, fallback: string) {
    return e?.data?.statusMessage || fallback
  }

  async function createItem(payload: Record<string, unknown>) {
    saving.value = true
    error.value = ''
    try {
      await $fetch(endpoint, { method: 'POST', body: payload })
      toast.add({ title: 'Data berhasil disimpan', color: 'success' })
      await fetchItems()
      return true
    } catch (e: any) {
      error.value = getErrorMessage(e, 'Gagal menyimpan data')
      return false
    } finally {
      saving.value = false
    }
  }

  async function updateItem(id: number, payload: Record<string, unknown>) {
    saving.value = true
    error.value = ''
    try {
      await $fetch(`${endpoint}/${id}`, { method: 'PUT', body: payload })
      toast.add({ title: 'Data berhasil diperbarui', color: 'success' })
      await fetchItems()
      return true
    } catch (e: any) {
      error.value = getErrorMessage(e, 'Gagal menyimpan data')
      return false
    } finally {
      saving.value = false
    }
  }

  async function deleteItem(id: number) {
    saving.value = true
    error.value = ''
    try {
      await $fetch(`${endpoint}/${id}`, { method: 'DELETE' })
      toast.add({ title: 'Data berhasil dihapus', color: 'success' })
      await fetchItems()
      return true
    } catch (e: any) {
      error.value = getErrorMessage(e, 'Gagal menghapus data')
      toast.add({ title: error.value, color: 'error' })
      return false
    } finally {
      saving.value = false
    }
  }

  return { items, loading, saving, error, fetchItems, createItem, updateItem, deleteItem }
}
