<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  Dialog,
  IconRefreshLine,
  Toast,
  VButton,
  VCard,
  VDropdownItem,
  VEmpty,
  VEntity,
  VEntityContainer,
  VEntityField,
  VLoading,
  VModal,
  VPageHeader,
  VPagination,
  VSpace,
  VStatusDot,
  VSwitch,
  VTag,
} from '@halo-dev/components'
import { utils } from '@halo-dev/ui-shared'
import RiAddLine from '~icons/ri/add-line'
import RiBearSmileLine from '~icons/ri/bear-smile-line'
import RiDownloadCloudLine from '~icons/ri/download-cloud-line'
import RiExternalLinkLine from '~icons/ri/external-link-line'
import RiSparkling2Line from '~icons/ri/sparkling-2-line'
import RiStore2Line from '~icons/ri/store-2-line'
import { petApi, type PetCompanion, type PetdexCatalogItem } from '@/api/pets'
import { hasUiPermission } from '@/utils/permissions'

const PET_FRAME_WIDTH = 192
const PET_FRAME_HEIGHT = 208
const PET_SPRITESHEET_COLUMNS = 8
const PET_SPRITESHEET_ROWS = 9
const PET_LIST_PREVIEW_HEIGHT = 64
const PET_CATALOG_PREVIEW_HEIGHT = 64
const PET_DELETING_REFETCH_INTERVAL = 1000
// Halo registers these FormKit inputs globally, but @formkit/vue typings do not list them.
const haloAttachmentType = 'attachment' as 'text'
const haloAttachmentInputType = 'attachmentInput' as 'text'

const loading = ref(false)
const importing = ref(false)
const saving = ref(false)
const mutating = ref(false)
const loadingPetdexCatalog = ref(false)
const importingCatalogPet = ref('')
const pets = ref<PetCompanion[]>([])
const petPage = ref(1)
const petPageSize = ref(10)
const petdexCatalog = ref<PetdexCatalogItem[]>([])
const petdexCatalogGeneratedAt = ref('')
const showPetdexCatalogModal = ref(false)
const petdexCatalogKeyword = ref('')
const petdexCatalogKind = ref('')
const petdexCatalogPage = ref(1)
const petdexCatalogPageSize = ref(24)
const PETS_MANAGE_PERMISSION = 'plugin:summaraidGPT:pets:manage'

let deletingPetRefetchTimer: number | undefined

const importForm = reactive({
  command: '',
})

const showPetModal = ref(false)
const editingPet = ref<PetCompanion>()
const petForm = reactive({
  name: '',
  displayName: '',
  description: '',
  petdexId: '',
  installCommand: '',
  installScriptUrl: '',
  petJsonUrl: '',
  spritesheetUrl: '',
  activate: true,
})

const activePet = computed(() => pets.value.find((pet) => pet.spec?.active))
const canManagePets = computed(() => hasUiPermission(PETS_MANAGE_PERMISSION))

const importedPetdexKeys = computed(() => {
  const keys = new Set<string>()
  pets.value.forEach((pet) => {
    const spec = pet.spec
    if (spec?.petdexId) {
      keys.add(spec.petdexId)
    }
    if (spec?.petJsonUrl) {
      keys.add(spec.petJsonUrl)
    }
    if (spec?.spritesheetUrl) {
      keys.add(spec.spritesheetUrl)
    }
  })
  return keys
})

const petdexCatalogKinds = computed(() => {
  const names = new Set<string>()
  petdexCatalog.value.forEach((pet) => {
    if (pet.kind) {
      names.add(pet.kind)
    }
  })
  return Array.from(names).sort((left, right) => kindText(left).localeCompare(kindText(right)))
})

const petdexCatalogKindItems = computed(() => [
  { label: '全部类型', value: '' },
  ...petdexCatalogKinds.value.map((kind) => ({ label: kindText(kind), value: kind })),
])

const filteredPetdexCatalog = computed(() => {
  const keyword = petdexCatalogKeyword.value.trim().toLowerCase()
  return petdexCatalog.value.filter((pet) => {
    if (petdexCatalogKind.value && pet.kind !== petdexCatalogKind.value) {
      return false
    }
    if (!keyword) {
      return true
    }
    return [pet.slug, pet.displayName, pet.kind, pet.submittedBy]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(keyword))
  })
})

const pagedPetdexCatalog = computed(() => {
  const start = (petdexCatalogPage.value - 1) * petdexCatalogPageSize.value
  return filteredPetdexCatalog.value.slice(start, start + petdexCatalogPageSize.value)
})

const pagedPets = computed(() => {
  const start = (petPage.value - 1) * petPageSize.value
  return pets.value.slice(start, start + petPageSize.value)
})

const normalizePetPage = () => {
  const maxPage = Math.max(1, Math.ceil(pets.value.length / petPageSize.value))
  petPage.value = Math.min(petPage.value, maxPage)
}

const deletingPetRefetchInterval = (data?: PetCompanion[]) => {
  const hasDeletingPet = data?.some((pet) => pet.metadata.deletionTimestamp)
  return hasDeletingPet ? PET_DELETING_REFETCH_INTERVAL : false
}

const clearDeletingPetRefetch = () => {
  if (!deletingPetRefetchTimer) {
    return
  }
  window.clearInterval(deletingPetRefetchTimer)
  deletingPetRefetchTimer = undefined
}

const syncDeletingPetRefetch = (data = pets.value) => {
  const interval = deletingPetRefetchInterval(data)
  if (!interval) {
    clearDeletingPetRefetch()
    return
  }
  if (deletingPetRefetchTimer) {
    return
  }
  deletingPetRefetchTimer = window.setInterval(() => {
    loadPets({ silent: true })
  }, interval)
}

const loadPets = async (options: { silent?: boolean } = {}) => {
  if (!options.silent) {
    loading.value = true
  }
  try {
    pets.value = await petApi.list()
    normalizePetPage()
    syncDeletingPetRefetch()
  } catch (error) {
    if (!options.silent) {
      Toast.error('宠物列表加载失败')
    }
  } finally {
    if (!options.silent) {
      loading.value = false
    }
  }
}

const openPetdexCatalog = async () => {
  showPetdexCatalogModal.value = true
  if (petdexCatalog.value.length === 0) {
    await loadPetdexCatalog()
  }
}

const loadPetdexCatalog = async () => {
  loadingPetdexCatalog.value = true
  try {
    const catalog = await petApi.listPetdexCatalog()
    petdexCatalog.value = catalog.items || []
    petdexCatalogGeneratedAt.value = catalog.generatedAt || ''
    petdexCatalogPage.value = 1
  } catch (error) {
    Toast.error('PetDex 宠物库加载失败')
  } finally {
    loadingPetdexCatalog.value = false
  }
}

const importPet = async () => {
  if (!importForm.command.trim()) {
    Toast.warning('请粘贴 PetDex 安装命令')
    return
  }
  importing.value = true
  try {
    const pet = await petApi.importFromPetdex({
      command: importForm.command.trim(),
      enabled: true,
      active: true,
    })
    Toast.success(`已导入并启用 ${displayName(pet)}`)
    await loadPets()
  } catch (error) {
    Toast.error('导入失败，请确认命令来自 petdex.dev/install')
  } finally {
    importing.value = false
  }
}

const importCatalogPet = async (pet: PetdexCatalogItem) => {
  importingCatalogPet.value = pet.slug
  try {
    await petApi.save({
      name: resourceName(pet.slug),
      displayName: pet.displayName,
      description: catalogDescription(pet),
      source: 'PETDEX',
      petdexId: pet.slug,
      installScriptUrl: pet.installScriptUrl,
      petJsonUrl: pet.petJsonUrl,
      spritesheetUrl: pet.spritesheetUrl,
      enabled: true,
      active: true,
    })
    Toast.success(`已导入并启用 ${pet.displayName}`)
    await loadPets()
  } catch (error) {
    Toast.error(petApi.errorMessage(error, '导入失败'))
  } finally {
    importingCatalogPet.value = ''
  }
}

const openPetModal = (pet?: PetCompanion) => {
  editingPet.value = pet
  petForm.name = pet?.metadata.name || ''
  petForm.displayName = pet?.spec?.displayName || ''
  petForm.description = pet?.spec?.description || ''
  petForm.petdexId = pet?.spec?.petdexId || ''
  petForm.installCommand = pet?.spec?.installCommand || ''
  petForm.installScriptUrl = pet?.spec?.installScriptUrl || ''
  petForm.petJsonUrl = pet?.spec?.petJsonUrl || ''
  petForm.spritesheetUrl = pet?.spec?.spritesheetUrl || ''
  petForm.activate = pet ? pet.spec?.active === true : true
  showPetModal.value = true
}

const savePet = async () => {
  if (!petForm.displayName.trim()) {
    Toast.warning('请填写宠物名称')
    return
  }
  const spritesheetUrl = attachmentUrl(petForm.spritesheetUrl)
  const petJsonUrl = attachmentUrl(petForm.petJsonUrl)
  if (!spritesheetUrl) {
    Toast.warning('请选择 spritesheet 图片')
    return
  }
  saving.value = true
  try {
    await petApi.save({
      name: petForm.name || undefined,
      displayName: petForm.displayName.trim(),
      description: petForm.description.trim() || undefined,
      source: editingPet.value?.spec?.source || 'PETDEX',
      petdexId: petForm.petdexId.trim() || undefined,
      installCommand: petForm.installCommand.trim() || undefined,
      installScriptUrl: petForm.installScriptUrl.trim() || undefined,
      petJsonUrl: petJsonUrl || undefined,
      spritesheetUrl,
      enabled: petForm.activate,
      active: petForm.activate,
    })
    Toast.success('保存成功')
    showPetModal.value = false
    await loadPets()
  } catch (error) {
    Toast.error(petApi.errorMessage(error, '保存失败'))
  } finally {
    saving.value = false
  }
}

const enablePet = async (pet: PetCompanion) => {
  mutating.value = true
  try {
    await petApi.setActive(pet.metadata.name)
    Toast.success(`已启用 ${displayName(pet)}`)
    await loadPets()
  } catch (error) {
    Toast.error('设置失败')
  } finally {
    mutating.value = false
  }
}

const deletePet = (pet: PetCompanion) => {
  Dialog.warning({
    title: '删除宠物',
    description: `确定删除「${displayName(pet)}」吗？删除后前台会使用内置默认宠物。`,
    confirmType: 'danger',
    onConfirm: async () => {
      mutating.value = true
      try {
        await petApi.delete(pet.metadata.name)
        Toast.success('已删除')
        await loadPets()
      } catch (error) {
        Toast.error('删除失败')
      } finally {
        mutating.value = false
      }
    },
  })
}

const openPetModalFromDropdown = (event: Event, pet: PetCompanion) => {
  event.stopPropagation()
  openPetModal(pet)
}

const deletePetFromDropdown = (event: Event, pet: PetCompanion) => {
  event.stopPropagation()
  deletePet(pet)
}

const previewStyle = (pet: PetCompanion) => {
  return spritePreviewStyle(pet.spec?.spritesheetUrl, PET_LIST_PREVIEW_HEIGHT)
}

const displayName = (pet?: PetCompanion) =>
  pet?.spec?.displayName || pet?.metadata.name || '未命名宠物'

const sourceUrl = (pet: PetCompanion) =>
  pet.spec?.installScriptUrl || pet.spec?.petJsonUrl || pet.spec?.spritesheetUrl

const spritePreviewStyle = (spritesheetUrl?: string, frameHeight = PET_LIST_PREVIEW_HEIGHT) => {
  const frameWidth = Math.round((frameHeight * PET_FRAME_WIDTH) / PET_FRAME_HEIGHT)
  return {
    width: `${frameWidth}px`,
    height: `${frameHeight}px`,
    backgroundImage: spritesheetUrl
      ? `url("${spritesheetUrl.replace(/["\\\n\r\f]/g, '')}")`
      : undefined,
    backgroundSize: `${frameWidth * PET_SPRITESHEET_COLUMNS}px ${
      frameHeight * PET_SPRITESHEET_ROWS
    }px`,
  }
}

const statusInfo = (pet: PetCompanion) => {
  if (pet.spec?.active) {
    return { state: 'success' as const, text: '启用中' }
  }
  return { state: 'default' as const, text: '未启用' }
}

const isPetdexCatalogImported = (pet: PetdexCatalogItem) =>
  importedPetdexKeys.value.has(pet.slug) ||
  importedPetdexKeys.value.has(pet.petJsonUrl) ||
  importedPetdexKeys.value.has(pet.spritesheetUrl)

const kindText = (kind?: string) => {
  if (kind === 'character') return '角色'
  if (kind === 'creature') return '生物'
  if (kind === 'object') return '物件'
  return kind || '其他'
}

const catalogDescription = (pet: PetdexCatalogItem) => {
  const parts = [`PetDex ${kindText(pet.kind)}`]
  if (pet.submittedBy) {
    parts.push(`提交者 ${pet.submittedBy}`)
  }
  return parts.join('，')
}

const resourceName = (slug: string) => `pet-${slug.replace(/[^a-zA-Z0-9.-]/g, '-')}`

const attachmentUrl = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (Array.isArray(value)) {
    return attachmentUrl(value[0])
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return attachmentUrl(
      record.url ||
        record.permalink ||
        record.href ||
        record.path ||
        (record.status as Record<string, unknown> | undefined)?.permalink ||
        (record.spec as Record<string, unknown> | undefined)?.url,
    )
  }
  return ''
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  return utils.date.format(value)
}

watch([petdexCatalogKeyword, petdexCatalogKind], () => {
  petdexCatalogPage.value = 1
})

watch(() => pets.value.length, normalizePetPage)

watch(petPageSize, () => {
  normalizePetPage()
})

onBeforeUnmount(() => {
  clearDeletingPetRefetch()
})

onMounted(loadPets)
</script>

<template>
  <VPageHeader title="宠物列表">
    <template #icon>
      <RiBearSmileLine class="mr-2 self-center" />
    </template>
    <template #actions>
      <VSpace>
        <VButton type="secondary" :loading="loading" @click="loadPets()">
          <template #icon>
            <IconRefreshLine class="h-full w-full" />
          </template>
          刷新
        </VButton>
        <VButton
          v-if="canManagePets"
          v-permission="[PETS_MANAGE_PERMISSION]"
          type="secondary"
          @click="openPetdexCatalog"
        >
          <template #icon>
            <RiStore2Line class="h-full w-full" />
          </template>
          PetDex 宠物库
        </VButton>
        <VButton
          v-if="canManagePets"
          v-permission="[PETS_MANAGE_PERMISSION]"
          type="secondary"
          @click="openPetModal()"
        >
          <template #icon>
            <RiAddLine class="h-full w-full" />
          </template>
          手动添加
        </VButton>
      </VSpace>
    </template>
  </VPageHeader>

  <div class=":uno: m-0 grid gap-3 p-3 md:m-4 md:p-0">
    <VCard
      v-if="canManagePets"
      v-permission="[PETS_MANAGE_PERMISSION]"
      class=":uno: overflow-hidden"
      :body-class="[':uno: !p-0']"
    >
      <div
        class="pet-import-compact :uno: grid grid-cols-[minmax(150px,220px)_minmax(0,1fr)_max-content] items-center gap-3 px-3.5 py-3 max-[860px]:grid-cols-1"
      >
        <div class=":uno: grid min-w-0 gap-0.5">
          <strong class=":uno: text-[13px] font-bold leading-snug text-gray-900">
            PetDex 导入
          </strong>
          <span
            class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-snug text-slate-500"
          >
            粘贴安装命令，只读取远程资源链接。
          </span>
        </div>
        <FormKit
          v-model="importForm.command"
          type="text"
          name="petdexCommand"
          placeholder="curl -sSf https://petdex.dev/install/iikun | sh"
        />
        <VButton type="primary" :loading="importing" @click="importPet">
          <template #icon>
            <RiSparkling2Line class="h-full w-full" />
          </template>
          导入并启用
        </VButton>
      </div>
    </VCard>

    <VCard :body-class="[':uno: !p-0']">
      <template #header>
        <div class=":uno: flex w-full items-center justify-between gap-3 bg-gray-50 px-4 py-3">
          <div class=":uno: flex min-w-0 flex-wrap items-center gap-2 text-xs text-gray-500">
            <strong class=":uno: text-lg leading-none text-gray-900">{{ pets.length }}</strong>
            <span>个宠物</span>
            <span>当前启用：{{ activePet ? displayName(activePet) : '未设置' }}</span>
          </div>
        </div>
      </template>

      <VLoading v-if="loading" />
      <VEmpty
        v-else-if="pets.length === 0"
        title="暂无宠物"
        :message="
          canManagePets
            ? '粘贴 PetDex 安装命令即可导入一个前台悬浮宠物'
            : '当前账号可以查看宠物配置，但不能新增或修改宠物'
        "
      />

      <VEntityContainer v-else class="pet-list :uno: overflow-hidden">
        <VEntity
          v-for="pet in pagedPets"
          :key="pet.metadata.name"
          :is-selected="pet.spec?.active === true"
          :class="{
            ':uno: opacity-[0.64]': pet.spec?.enabled === false,
            ':uno: pointer-events-none opacity-[0.56]': !!pet.metadata.deletionTimestamp,
          }"
        >
          <template #start>
            <div
              class=":uno: relative grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50"
            >
              <span
                class=":uno: absolute bottom-2 h-1.5 w-10 rounded-full bg-slate-900/10 blur-[3px]"
              ></span>
              <span
                class=":uno: relative block bg-no-repeat drop-shadow-[0_7px_8px_rgba(15,23,42,0.16)] [background-position:0_0] [image-rendering:pixelated]"
                :style="previewStyle(pet)"
              ></span>
            </div>
            <VEntityField
              :title="displayName(pet)"
              :description="pet.spec?.description || pet.metadata.name"
              width="22rem"
            >
              <template #extra>
                <VStatusDot
                  v-if="pet.metadata.deletionTimestamp"
                  v-tooltip="'删除中'"
                  state="warning"
                  text="删除中"
                />
                <VStatusDot v-else v-bind="statusInfo(pet)" />
              </template>
            </VEntityField>
          </template>

          <template #end>
            <VEntityField>
              <template #description>
                <VTag size="sm">{{ pet.spec?.source || 'PETDEX' }}</VTag>
              </template>
            </VEntityField>
            <VEntityField v-if="pet.spec?.petdexId" width="8rem">
              <template #description>
                <span
                  class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500"
                >
                  {{ pet.spec.petdexId }}
                </span>
              </template>
            </VEntityField>
            <VEntityField v-if="sourceUrl(pet)" width="12rem">
              <template #description>
                <a
                  :href="sourceUrl(pet)"
                  target="_blank"
                  rel="noopener noreferrer"
                  :title="sourceUrl(pet)"
                  class=":uno: inline-flex max-w-full items-center gap-[5px] overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-tight text-blue-600 no-underline"
                  @click.stop
                >
                  <RiExternalLinkLine class=":uno: h-[13px] w-[13px] flex-none" />
                  <span class=":uno: overflow-hidden text-ellipsis">{{ sourceUrl(pet) }}</span>
                </a>
              </template>
            </VEntityField>
            <VEntityField>
              <template #description>
                <span
                  class=":uno: overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-400 tabular-nums"
                >
                  {{ formatDate(pet.status?.updatedAt || pet.status?.importedAt) }}
                </span>
              </template>
            </VEntityField>

            <VEntityField
              v-if="canManagePets && !pet.metadata.deletionTimestamp"
              v-permission="[PETS_MANAGE_PERMISSION]"
            >
              <template #description>
                <VSwitch
                  :model-value="pet.spec?.active === true"
                  :disabled="mutating || pet.spec?.active === true"
                  @update:model-value="(checked) => checked && enablePet(pet)"
                />
              </template>
            </VEntityField>
          </template>

          <template v-if="canManagePets && !pet.metadata.deletionTimestamp" #dropdownItems>
            <VDropdownItem
              v-permission="[PETS_MANAGE_PERMISSION]"
              @click="openPetModalFromDropdown($event, pet)"
            >
              编辑
            </VDropdownItem>
            <VDropdownItem
              v-permission="[PETS_MANAGE_PERMISSION]"
              type="danger"
              :disabled="mutating"
              @click="deletePetFromDropdown($event, pet)"
            >
              删除
            </VDropdownItem>
          </template>
        </VEntity>
      </VEntityContainer>

      <template v-if="pets.length > 0" #footer>
        <VPagination
          v-model:page="petPage"
          v-model:size="petPageSize"
          page-label="页"
          size-label="条 / 页"
          :total-label="`共 ${pets.length} 项数据`"
          :total="pets.length"
          :size-options="[10, 20, 50]"
        />
      </template>
    </VCard>
  </div>

  <VModal
    v-model:visible="showPetModal"
    :title="editingPet ? '编辑宠物' : '手动添加宠物'"
    :width="680"
  >
    <div class="pet-form-stack :uno: grid w-full min-w-0 gap-3">
      <section class=":uno: grid gap-3 rounded-lg border border-[#edf0f5] bg-white p-3.5">
        <div class=":uno: text-[13px] font-bold leading-tight text-gray-900">基础信息</div>
        <div class=":uno: grid w-full min-w-0 grid-cols-1 gap-3">
          <FormKit
            v-model="petForm.displayName"
            type="text"
            name="displayName"
            label="名称"
            placeholder="如：iikun"
            validation="required"
          />
          <FormKit
            v-model="petForm.petdexId"
            type="text"
            name="petdexId"
            label="PetDex ID"
            placeholder="可选"
          />
        </div>
        <FormKit
          v-model="petForm.description"
          type="text"
          name="description"
          label="描述"
          placeholder="可选"
        />
      </section>

      <section class=":uno: grid gap-3 rounded-lg border border-[#edf0f5] bg-white p-3.5">
        <div class=":uno: text-[13px] font-bold leading-tight text-gray-900">宠物资源</div>
        <div class=":uno: grid gap-3.5">
          <FormKit
            v-model="petForm.spritesheetUrl"
            :type="haloAttachmentType"
            name="spritesheetUrl"
            label="Spritesheet 图片"
            validation="required"
            :accepts="['image/*']"
            width="160px"
            aspect-ratio="1/1"
            help="上传或选择宠物 spritesheet 图片。"
          />
          <FormKit
            v-model="petForm.petJsonUrl"
            :type="haloAttachmentInputType"
            name="petJsonUrl"
            label="pet.json 文件"
            :accepts="['application/json', '.json']"
            :min="0"
            :max="1"
            help="可选，选择 PetDex 的 pet.json 文件。"
          />
        </div>
      </section>

      <section class=":uno: grid gap-3 rounded-lg border border-[#edf0f5] bg-white px-3.5 py-3">
        <label class=":uno: inline-flex items-center gap-2 text-[13px] text-slate-700">
          <VSwitch v-model="petForm.activate" />
          <span>保存后启用这个宠物</span>
        </label>
      </section>
    </div>
    <template #footer>
      <VSpace>
        <VButton @click="showPetModal = false">取消</VButton>
        <VButton type="primary" :loading="saving" @click="savePet">保存</VButton>
      </VSpace>
    </template>
  </VModal>

  <VModal v-model:visible="showPetdexCatalogModal" title="PetDex 宠物库" :width="920">
    <div class=":uno: grid gap-3">
      <div class=":uno: flex items-center justify-between gap-3">
        <div class=":uno: flex flex-wrap items-center gap-2 text-[13px] text-slate-500">
          <strong class=":uno: text-lg leading-none text-gray-900">
            {{ petdexCatalog.length || '—' }}
          </strong>
          <span>个公开宠物</span>
          <span v-if="petdexCatalogGeneratedAt">
            更新 {{ formatDate(petdexCatalogGeneratedAt) }}
          </span>
        </div>
        <VButton size="sm" :loading="loadingPetdexCatalog" @click="loadPetdexCatalog">
          <template #icon>
            <IconRefreshLine class="h-full w-full" />
          </template>
          刷新
        </VButton>
      </div>

      <div
        class=":uno: grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 max-[860px]:grid-cols-1"
      >
        <SearchInput v-model="petdexCatalogKeyword" placeholder="搜索名称、ID、提交者" />
        <FilterDropdown v-model="petdexCatalogKind" label="类型" :items="petdexCatalogKindItems" />
      </div>

      <VLoading v-if="loadingPetdexCatalog" />
      <VEmpty
        v-else-if="filteredPetdexCatalog.length === 0"
        title="没有匹配的宠物"
        message="换一个关键词或类型试试"
      />
      <VEntityContainer v-else class="catalog-list :uno: max-h-[560px] overflow-y-auto">
        <VEntity v-for="pet in pagedPetdexCatalog" :key="pet.slug">
          <template #start>
            <div
              class=":uno: grid w-[min(36rem,58vw)] min-w-0 grid-cols-[72px_minmax(0,1fr)] items-center gap-3 max-[860px]:w-full"
            >
              <div
                class=":uno: relative grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50"
              >
                <span
                  class=":uno: absolute bottom-2 h-1.5 w-10 rounded-full bg-slate-900/10 blur-[3px]"
                ></span>
                <span
                  class=":uno: relative block bg-no-repeat drop-shadow-[0_7px_8px_rgba(15,23,42,0.16)] [background-position:0_0] [image-rendering:pixelated]"
                  :style="spritePreviewStyle(pet.spritesheetUrl, PET_CATALOG_PREVIEW_HEIGHT)"
                ></span>
              </div>
              <VEntityField :title="pet.displayName">
                <template #description>
                  <span class=":uno: text-xs text-slate-500">
                    ID {{ pet.slug }}
                    <template v-if="pet.submittedBy"> · 提交者 {{ pet.submittedBy }}</template>
                  </span>
                </template>
              </VEntityField>
            </div>
          </template>
          <template #end>
            <VEntityField>
              <template #description>
                <VTag size="sm">{{ kindText(pet.kind) }}</VTag>
              </template>
            </VEntityField>
            <VEntityField v-if="isPetdexCatalogImported(pet)">
              <template #description>
                <VTag size="sm">已导入</VTag>
              </template>
            </VEntityField>
            <VEntityField v-if="canManagePets">
              <template #description>
                <VButton
                  v-permission="[PETS_MANAGE_PERMISSION]"
                  size="sm"
                  type="secondary"
                  :loading="importingCatalogPet === pet.slug"
                  @click="importCatalogPet(pet)"
                >
                  <template #icon>
                    <RiDownloadCloudLine class="h-full w-full" />
                  </template>
                  导入并启用
                </VButton>
              </template>
            </VEntityField>
          </template>
        </VEntity>
      </VEntityContainer>

      <div
        v-if="filteredPetdexCatalog.length > petdexCatalogPageSize"
        class=":uno: flex justify-end"
      >
        <VPagination
          v-model:page="petdexCatalogPage"
          v-model:size="petdexCatalogPageSize"
          :total="filteredPetdexCatalog.length"
          :size-options="[12, 24, 48, 96]"
        />
      </div>
    </div>
  </VModal>
</template>

<style scoped>
.pet-import-compact :deep(.formkit-outer) {
  margin-bottom: 0;
}

.pet-import-compact :deep(.formkit-wrapper),
.pet-import-compact :deep(.formkit-inner) {
  width: 100%;
  max-width: none;
}

.pet-import-compact :deep(input) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
}

.pet-list :deep(.entity-start) {
  min-width: 0;
  flex: 1 1 auto;
}

.pet-list :deep(.entity-end) {
  flex: 0 0 auto;
  gap: 16px;
  row-gap: 6px;
}

.pet-list :deep(.entity-field-wrapper) {
  max-width: none;
}

.pet-form-stack > * {
  min-width: 0;
}

.pet-form-stack :deep(.formkit-outer),
.pet-form-stack :deep(.formkit-wrapper),
.pet-form-stack :deep(.formkit-inner) {
  width: 100%;
  max-width: none;
  min-width: 0;
}

.pet-form-stack :deep(.formkit-input) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.catalog-list :deep(.entity-end) {
  gap: 12px;
  row-gap: 6px;
}

.catalog-list :deep(.entity-start) {
  min-width: 0;
  width: 100%;
}

@media (max-width: 640px) {
  .pet-list :deep(.entity-start),
  .pet-list :deep(.entity-end) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>
