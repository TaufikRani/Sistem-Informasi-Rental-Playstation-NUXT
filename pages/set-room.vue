<script setup lang="ts">
const toast = useToast()
const { data: rooms } = await useFetch('/api/rooms')
const { data: playstations } = await useFetch('/api/playstations')
const { data: televisions } = await useFetch('/api/televisions')
const { data: controllers } = await useFetch('/api/controllers')
const { data: playRates } = await useFetch('/api/play-rates')

const savingId = ref<string | null>(null)

const roomOptions = computed(() => [
  { label: '-- Lepas dari Room --', value: null },
  ...(rooms.value || []).map((r: any) => ({ label: r.name, value: r.id })),
])

function getDevices(roomId: number) {
  return {
    ps: (playstations.value || []).filter((p: any) => p.roomId === roomId),
    tv: (televisions.value || []).filter((t: any) => t.roomId === roomId),
    stick: (controllers.value || []).filter((c: any) => c.roomId === roomId),
  }
}

const unassigned = computed(() => ({
  ps: (playstations.value || []).filter((p: any) => !p.roomId),
  tv: (televisions.value || []).filter((t: any) => !t.roomId),
  stick: (controllers.value || []).filter((c: any) => !c.roomId),
}))

const playRateOptions = computed(() => [
  { label: '-- Tanpa Tarif --', value: null },
  ...(playRates.value || []).map((r: any) => ({ label: `${r.name} (${formatRupiah(r.hourlyRate)}/jam)`, value: r.id })),
])

const editingRateId = ref<number | null>(null)

async function updatePlayRate(roomId: number, playRateId: number | null) {
  editingRateId.value = roomId
  try {
    await $fetch(`/api/rooms/${roomId}`, {
      method: 'PUT',
      body: { playRateId },
    })
    rooms.value = await $fetch('/api/rooms')
    toast.add({ title: 'Tarif room diperbarui', color: 'success' })
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage || 'Gagal memperbarui', color: 'error' })
  } finally {
    editingRateId.value = null
  }
}

async function assignDevice(type: string, deviceId: number, newRoomId: number | null) {
  savingId.value = `${type}-${deviceId}`
  try {
    await $fetch(`/api/devices/${type}/${deviceId}/assign`, {
      method: 'PUT',
      body: { roomId: newRoomId },
    })
    toast.add({ title: 'Perangkat berhasil dipindahkan', color: 'success' })
    await Promise.all([
      $fetch('/api/playstations').then((d: any) => { playstations.value = d }),
      $fetch('/api/televisions').then((d: any) => { televisions.value = d }),
      $fetch('/api/controllers').then((d: any) => { controllers.value = d }),
    ])
  } catch (e: any) {
    toast.add({ title: e?.data?.statusMessage || 'Gagal memindahkan', color: 'error' })
  } finally {
    savingId.value = null
  }
}
</script>

<template>
  <UDashboardPanel id="set-room">
    <template #header>
      <UDashboardNavbar title="Set Room">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <p class="text-sm text-muted">
            Atur jenis room & perangkat (PS, TV, Stick) untuk setiap room
          </p>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Room Cards -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <UCard v-for="room in rooms" :key="room.id">
            <template #header>
              <div class="flex items-center gap-2 flex-wrap">
                <UIcon name="i-lucide-door-open" class="text-muted" />
                <span class="font-semibold">{{ room.name }}</span>
                <USelect
                  :items="playRateOptions"
                  :model-value="room.playRateId"
                  :loading="editingRateId === room.id"
                  @update:model-value="(v: any) => updatePlayRate(room.id, v)"
                  size="xs"
                  class="w-48"
                />
                <UBadge :color="statusColor(room.status)" variant="subtle" size="sm">
                  {{ ROOM_STATUS_LABEL[room.status] }}
                </UBadge>
              </div>
            </template>

            <div class="space-y-3">
              <!-- PlayStation -->
              <div>
                <div class="mb-1 text-xs font-medium text-muted flex items-center gap-1">
                  <UIcon name="i-lucide-gamepad-2" size="14" /> PlayStation
                </div>
                <div v-if="getDevices(room.id).ps.length" class="space-y-1.5">
                  <div v-for="ps in getDevices(room.id).ps" :key="ps.id"
                    class="flex items-center justify-between gap-2 rounded border p-2 text-sm">
                    <div>
                      <span class="font-medium">{{ ps.assetCode }}</span>
                      <span v-if="ps.series" class="ml-1 text-muted">({{ ps.series }})</span>
                    </div>
                    <USelect
                      :items="roomOptions"
                      :model-value="ps.roomId"
                      :loading="savingId === `playstation-${ps.id}`"
                      @update:model-value="(v: any) => assignDevice('playstation', ps.id, v)"
                      size="xs"
                      class="w-36"
                    />
                  </div>
                </div>
                <div v-else class="text-xs text-muted italic">Belum ada PS</div>
              </div>

              <!-- TV -->
              <div>
                <div class="mb-1 text-xs font-medium text-muted flex items-center gap-1">
                  <UIcon name="i-lucide-tv" size="14" /> TV
                </div>
                <div v-if="getDevices(room.id).tv.length" class="space-y-1.5">
                  <div v-for="tv in getDevices(room.id).tv" :key="tv.id"
                    class="flex items-center justify-between gap-2 rounded border p-2 text-sm">
                    <div>
                      <span class="font-medium">{{ tv.assetCode }}</span>
                      <span v-if="tv.size" class="ml-1 text-muted">({{ tv.size }})</span>
                    </div>
                    <USelect
                      :items="roomOptions"
                      :model-value="tv.roomId"
                      :loading="savingId === `television-${tv.id}`"
                      @update:model-value="(v: any) => assignDevice('television', tv.id, v)"
                      size="xs"
                      class="w-36"
                    />
                  </div>
                </div>
                <div v-else class="text-xs text-muted italic">Belum ada TV</div>
              </div>

              <!-- Stick -->
              <div>
                <div class="mb-1 text-xs font-medium text-muted flex items-center gap-1">
                  <UIcon name="i-lucide-wand-sparkles" size="14" /> Stick
                </div>
                <div v-if="getDevices(room.id).stick.length" class="space-y-1.5">
                  <div v-for="stick in getDevices(room.id).stick" :key="stick.id"
                    class="flex items-center justify-between gap-2 rounded border p-2 text-sm">
                    <span class="font-medium">{{ stick.assetCode }} — No. {{ stick.controllerNumber }}</span>
                    <USelect
                      :items="roomOptions"
                      :model-value="stick.roomId"
                      :loading="savingId === `controller-${stick.id}`"
                      @update:model-value="(v: any) => assignDevice('controller', stick.id, v)"
                      size="xs"
                      class="w-36"
                    />
                  </div>
                </div>
                <div v-else class="text-xs text-muted italic">Belum ada Stick</div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Unassigned -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-archive" class="text-muted" />
              <span class="font-semibold">Tanpa Room</span>
              <UBadge color="neutral" variant="subtle" size="sm">
                {{ unassigned.ps.length + unassigned.tv.length + unassigned.stick.length }}
              </UBadge>
            </div>
          </template>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <div class="mb-2 text-xs font-medium text-muted flex items-center gap-1">
                <UIcon name="i-lucide-gamepad-2" size="14" /> PlayStation ({{ unassigned.ps.length }})
              </div>
              <div v-if="unassigned.ps.length" class="space-y-1.5">
                <div v-for="ps in unassigned.ps" :key="ps.id"
                  class="flex items-center justify-between gap-2 rounded border p-2 text-sm">
                  <span class="font-medium">{{ ps.assetCode }}</span>
                  <USelect
                    :items="roomOptions"
                    :model-value="null"
                    :loading="savingId === `playstation-${ps.id}`"
                    @update:model-value="(v: any) => assignDevice('playstation', ps.id, v)"
                    size="xs"
                    class="w-36"
                  />
                </div>
              </div>
              <div v-else class="text-xs text-muted">Tidak ada</div>
            </div>

            <div>
              <div class="mb-2 text-xs font-medium text-muted flex items-center gap-1">
                <UIcon name="i-lucide-tv" size="14" /> TV ({{ unassigned.tv.length }})
              </div>
              <div v-if="unassigned.tv.length" class="space-y-1.5">
                <div v-for="tv in unassigned.tv" :key="tv.id"
                  class="flex items-center justify-between gap-2 rounded border p-2 text-sm">
                  <span class="font-medium">{{ tv.assetCode }}</span>
                  <USelect
                    :items="roomOptions"
                    :model-value="null"
                    :loading="savingId === `television-${tv.id}`"
                    @update:model-value="(v: any) => assignDevice('television', tv.id, v)"
                    size="xs"
                    class="w-36"
                  />
                </div>
              </div>
              <div v-else class="text-xs text-muted">Tidak ada</div>
            </div>

            <div>
              <div class="mb-2 text-xs font-medium text-muted flex items-center gap-1">
                <UIcon name="i-lucide-wand-sparkles" size="14" /> Stick ({{ unassigned.stick.length }})
              </div>
              <div v-if="unassigned.stick.length" class="space-y-1.5">
                <div v-for="stick in unassigned.stick" :key="stick.id"
                  class="flex items-center justify-between gap-2 rounded border p-2 text-sm">
                  <span class="font-medium">{{ stick.assetCode }}</span>
                  <USelect
                    :items="roomOptions"
                    :model-value="null"
                    :loading="savingId === `controller-${stick.id}`"
                    @update:model-value="(v: any) => assignDevice('controller', stick.id, v)"
                    size="xs"
                    class="w-36"
                  />
                </div>
              </div>
              <div v-else class="text-xs text-muted">Tidak ada</div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
