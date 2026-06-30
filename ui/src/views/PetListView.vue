<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  Dialog,
  IconRefreshLine,
  Toast,
  VButton,
  VEmpty,
  VLoading,
  VModal,
  VPageHeader,
  VPagination,
  VSpace,
  VStatusDot,
  VSwitch,
  VTag,
} from '@halo-dev/components'
import RiAddLine from '~icons/ri/add-line'
import RiBearSmileLine from '~icons/ri/bear-smile-line'
import RiDeleteBinLine from '~icons/ri/delete-bin-line'
import RiDownloadCloudLine from '~icons/ri/download-cloud-line'
import RiEdit2Line from '~icons/ri/edit-2-line'
import RiExternalLinkLine from '~icons/ri/external-link-line'
import RiSearchLine from '~icons/ri/search-line'
import RiSparkling2Line from '~icons/ri/sparkling-2-line'
import RiStore2Line from '~icons/ri/store-2-line'
import { petApi, type PetCompanion, type PetdexCatalogItem } from '@/api/pets'

const PET_PREVIEW_SIZE = 72
const PET_FRAME_HEIGHT_RATIO = 208 / 192
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
const petdexCatalog = ref<PetdexCatalogItem[]>([])
const petdexCatalogGeneratedAt = ref('')
const showPetdexCatalogModal = ref(false)
const petdexCatalogKeyword = ref('')
const petdexCatalogKind = ref('')
const petdexCatalogPage = ref(1)
const petdexCatalogPageSize = ref(24)

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
const importedCount = computed(
  () => pets.value.filter((pet) => pet.spec?.source === 'PETDEX').length,
)

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

const loadPets = async () => {
  loading.value = true
  try {
    pets.value = await petApi.list()
  } catch (error) {
    Toast.error('宠物列表加载失败')
  } finally {
    loading.value = false
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

const previewStyle = (pet: PetCompanion) => {
  return spritePreviewStyle(pet.spec?.spritesheetUrl)
}

const displayName = (pet?: PetCompanion) =>
  pet?.spec?.displayName || pet?.metadata.name || '未命名宠物'

const sourceUrl = (pet: PetCompanion) =>
  pet.spec?.installScriptUrl || pet.spec?.petJsonUrl || pet.spec?.spritesheetUrl

const spritePreviewStyle = (spritesheetUrl?: string, size = PET_PREVIEW_SIZE) => {
  const height = Math.round(size * PET_FRAME_HEIGHT_RATIO)
  return {
    width: `${size}px`,
    height: `${height}px`,
    backgroundImage: spritesheetUrl
      ? `url("${spritesheetUrl.replace(/["\\\n\r\f]/g, '')}")`
      : undefined,
    backgroundSize: `${size * 8}px ${height * 9}px`,
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
  return new Date(value).toLocaleString()
}

watch([petdexCatalogKeyword, petdexCatalogKind], () => {
  petdexCatalogPage.value = 1
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
        <VButton type="secondary" :loading="loading" @click="loadPets">
          <template #icon>
            <IconRefreshLine class="h-full w-full" />
          </template>
          刷新
        </VButton>
        <VButton type="secondary" @click="openPetdexCatalog">
          <template #icon>
            <RiStore2Line class="h-full w-full" />
          </template>
          PetDex 宠物库
        </VButton>
        <VButton type="secondary" @click="openPetModal()">
          <template #icon>
            <RiAddLine class="h-full w-full" />
          </template>
          手动添加
        </VButton>
      </VSpace>
    </template>
  </VPageHeader>

  <div class="pet-page">
    <section class="pet-import-panel">
      <div class="pet-import-head">
        <div>
          <span class="section-kicker">PetDex 导入</span>
          <h2>粘贴安装命令创建宠物</h2>
          <p>系统只读取远程 pet.json 与 spritesheet 链接，不执行脚本。</p>
        </div>
        <VTag size="sm">安全解析</VTag>
      </div>
      <div class="pet-import-form">
        <textarea
          v-model="importForm.command"
          rows="1"
          placeholder="curl -sSf https://petdex.dev/install/iikun | sh"
        />
        <VButton type="primary" :loading="importing" @click="importPet">
          <template #icon>
            <RiSparkling2Line class="h-full w-full" />
          </template>
          导入并启用
        </VButton>
      </div>
    </section>

    <section class="pet-list-section">
      <div class="pet-list-header">
        <div>
          <span class="section-kicker">宠物管理</span>
          <h2>前台悬浮宠物</h2>
          <p>
            {{ pets.length }} 个宠物，已启用：
            <strong>{{ activePet ? displayName(activePet) : '未设置' }}</strong>
          </p>
        </div>
        <div class="pet-stat-strip">
          <span>PetDex {{ importedCount }}</span>
          <span>全部 {{ pets.length }}</span>
        </div>
      </div>

      <VLoading v-if="loading" />
      <VEmpty
        v-else-if="pets.length === 0"
        title="暂无宠物"
        message="粘贴 PetDex 安装命令即可导入一个前台悬浮宠物"
      />

      <div v-else class="pet-list">
        <article
          v-for="pet in pets"
          :key="pet.metadata.name"
          class="pet-row"
          :class="{ active: pet.spec?.active, disabled: pet.spec?.enabled === false }"
        >
          <div class="pet-preview-stage">
            <span class="pet-shadow"></span>
            <span class="pet-sprite-preview" :style="previewStyle(pet)"></span>
          </div>

          <div class="pet-info">
            <div class="pet-title-row">
              <h3>{{ displayName(pet) }}</h3>
              <VStatusDot v-bind="statusInfo(pet)" />
            </div>
            <p>{{ pet.spec?.description || '暂无描述' }}</p>
            <div class="pet-meta">
              <span>
                来源 <b>{{ pet.spec?.source || 'PETDEX' }}</b>
              </span>
              <span v-if="pet.spec?.petdexId">
                ID <b>{{ pet.spec.petdexId }}</b>
              </span>
              <span>
                更新 <b>{{ formatDate(pet.status?.updatedAt || pet.status?.importedAt) }}</b>
              </span>
            </div>
            <a
              v-if="sourceUrl(pet)"
              class="pet-link"
              :href="sourceUrl(pet)"
              target="_blank"
              rel="noopener noreferrer"
              :title="sourceUrl(pet)"
            >
              <RiExternalLinkLine />
              <span>{{ sourceUrl(pet) }}</span>
            </a>
          </div>

          <div class="pet-actions">
            <label class="pet-toggle">
              <span>启用</span>
              <VSwitch
                :model-value="pet.spec?.active === true"
                :disabled="mutating || pet.spec?.active === true"
                @update:model-value="(checked) => checked && enablePet(pet)"
              />
            </label>
            <button class="icon-action" title="编辑" @click="openPetModal(pet)">
              <RiEdit2Line />
            </button>
            <button class="icon-action danger" title="删除" @click="deletePet(pet)">
              <RiDeleteBinLine />
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>

  <VModal
    v-model:visible="showPetModal"
    :title="editingPet ? '编辑宠物' : '手动添加宠物'"
    :width="680"
  >
    <div class="form-stack">
      <div class="form-grid">
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
      <div class="form-grid">
        <FormKit
          v-model="petForm.spritesheetUrl"
          :type="haloAttachmentType"
          name="spritesheetUrl"
          label="Spritesheet 图片"
          validation="required"
          :accepts="['image/*']"
          width="132px"
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
      <div class="switch-grid">
        <label class="switch-row">
          <VSwitch v-model="petForm.activate" />
          <span>保存后启用这个宠物</span>
        </label>
      </div>
    </div>
    <template #footer>
      <VSpace>
        <VButton @click="showPetModal = false">取消</VButton>
        <VButton type="primary" :loading="saving" @click="savePet">保存</VButton>
      </VSpace>
    </template>
  </VModal>

  <VModal v-model:visible="showPetdexCatalogModal" title="PetDex 宠物库" :width="920">
    <div class="catalog-panel">
      <div class="catalog-toolbar">
        <div class="catalog-summary">
          <strong>{{ petdexCatalog.length || '—' }}</strong>
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

      <div class="catalog-filter">
        <label class="catalog-search">
          <RiSearchLine />
          <input v-model="petdexCatalogKeyword" placeholder="搜索名称、ID、提交者" />
        </label>
        <select v-model="petdexCatalogKind" class="catalog-kind-select">
          <option value="">全部类型</option>
          <option v-for="kind in petdexCatalogKinds" :key="kind" :value="kind">
            {{ kindText(kind) }}
          </option>
        </select>
      </div>

      <VLoading v-if="loadingPetdexCatalog" />
      <VEmpty
        v-else-if="filteredPetdexCatalog.length === 0"
        title="没有匹配的宠物"
        message="换一个关键词或类型试试"
      />
      <div v-else class="catalog-list">
        <article v-for="pet in pagedPetdexCatalog" :key="pet.slug" class="catalog-item">
          <div class="catalog-preview-stage">
            <span class="pet-shadow"></span>
            <span
              class="pet-sprite-preview catalog-sprite"
              :style="spritePreviewStyle(pet.spritesheetUrl, 60)"
            ></span>
          </div>
          <div class="catalog-info">
            <div class="catalog-title-row">
              <h3>{{ pet.displayName }}</h3>
              <VTag size="sm">{{ kindText(pet.kind) }}</VTag>
              <VTag v-if="isPetdexCatalogImported(pet)" size="sm">已导入</VTag>
            </div>
            <p>
              <span>ID {{ pet.slug }}</span>
              <span v-if="pet.submittedBy">提交者 {{ pet.submittedBy }}</span>
            </p>
          </div>
          <VButton
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
        </article>
      </div>

      <div v-if="filteredPetdexCatalog.length > petdexCatalogPageSize" class="catalog-pagination">
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

<style scoped lang="scss">
.pet-page {
  display: grid;
  gap: 14px;
  padding: 14px;
}

.pet-import-panel,
.pet-list-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.pet-import-panel {
  display: grid;
  gap: 12px;
  padding: 14px;
}

.pet-import-head,
.pet-list-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;

  h2 {
    margin: 2px 0 0;
    color: #111827;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.35;
  }

  p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
  }
}

.section-kicker {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-weight: 650;
}

.pet-import-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: stretch;

  textarea {
    min-height: 44px;
    resize: vertical;
    border: 1px solid #d8dee8;
    border-radius: 7px;
    padding: 10px 11px;
    color: #111827;
    background: #fff;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    line-height: 1.45;
    outline: none;
  }

  textarea:focus {
    border-color: #94a3b8;
    box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.12);
  }
}

.switch-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.switch-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 13px;
}

.pet-list-section {
  overflow: hidden;
}

.pet-list-header {
  padding: 14px 16px;
  border-bottom: 1px solid #edf0f5;

  strong {
    color: #0f766e;
    font-weight: 700;
  }
}

.pet-stat-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;

  span {
    padding: 4px 8px;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    color: #64748b;
    background: #f8fafc;
    font-size: 12px;
    white-space: nowrap;
  }
}

.pet-list {
  display: grid;
}

.pet-row {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #edf0f5;
  background: #fff;
}

.pet-row:last-child {
  border-bottom: none;
}

.pet-row:hover {
  background: #fafafa;
}

.pet-row.active {
  background: #f8fffc;
  box-shadow: inset 3px 0 0 #14b8a6;
}

.pet-row.disabled {
  opacity: 0.64;
}

.pet-preview-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  overflow: hidden;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  background: #f8fafc;
}

.pet-shadow {
  position: absolute;
  bottom: 9px;
  width: 44px;
  height: 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.1);
  filter: blur(3px);
}

.pet-sprite-preview {
  position: relative;
  display: block;
  background-repeat: no-repeat;
  background-position: 0 0;
  filter: drop-shadow(0 7px 8px rgba(15, 23, 42, 0.16));
  image-rendering: pixelated;
  transform: scale(0.82);
  transform-origin: center bottom;
}

.pet-info {
  min-width: 0;

  h3 {
    margin: 0;
    overflow: hidden;
    color: #111827;
    font-size: 15px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    display: -webkit-box;
    margin: 4px 0 0;
    overflow: hidden;
    color: #64748b;
    font-size: 13px;
    line-height: 1.45;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.pet-title-row {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.pet-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;

  b {
    color: #475569;
    font-weight: 650;
  }
}

.pet-link {
  display: grid;
  grid-template-columns: 15px minmax(0, 1fr);
  gap: 6px;
  align-items: center;
  max-width: 520px;
  margin-top: 7px;
  color: #2563eb;
  font-size: 12px;
  text-decoration: none;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.pet-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.pet-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #475569;
  font-size: 12px;
  font-weight: 650;
}

.icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #dbe3ef;
  border-radius: 7px;
  color: #475569;
  background: #fff;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }
}

.icon-action:hover {
  color: #111827;
  background: #f8fafc;
}

.icon-action.danger:hover {
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.22);
  background: #fff7f7;
}

.form-stack {
  display: grid;
  gap: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.catalog-panel {
  display: grid;
  gap: 12px;
}

.catalog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.catalog-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: #64748b;
  font-size: 13px;

  strong {
    color: #111827;
    font-size: 18px;
    line-height: 1;
  }
}

.catalog-filter {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 148px;
  gap: 10px;
}

.catalog-search {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  border: 1px solid #d8dee8;
  border-radius: 7px;
  padding: 0 10px;
  background: #fff;

  svg {
    color: #94a3b8;
  }

  input {
    min-width: 0;
    border: 0;
    padding: 9px 0;
    color: #111827;
    font-size: 13px;
    outline: none;
  }
}

.catalog-search:focus-within,
.catalog-kind-select:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.12);
}

.catalog-kind-select {
  border: 1px solid #d8dee8;
  border-radius: 7px;
  padding: 0 10px;
  color: #334155;
  background: #fff;
  font-size: 13px;
  outline: none;
}

.catalog-list {
  display: grid;
  max-height: 560px;
  overflow-y: auto;
  border: 1px solid #edf0f5;
  border-radius: 8px;
}

.catalog-item {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #edf0f5;
  background: #fff;
}

.catalog-item:last-child {
  border-bottom: none;
}

.catalog-item:hover {
  background: #fafafa;
}

.catalog-preview-stage {
  position: relative;
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  overflow: hidden;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  background: #f8fafc;
}

.catalog-sprite {
  transform: scale(0.78);
}

.catalog-info {
  min-width: 0;
}

.catalog-title-row {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;

  h3 {
    margin: 0;
    overflow: hidden;
    color: #111827;
    font-size: 14px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.catalog-info p {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
}

.catalog-pagination {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 860px) {
  .pet-import-head,
  .pet-list-header {
    flex-direction: column;
  }

  .pet-import-form,
  .pet-row,
  .catalog-filter,
  .catalog-item {
    grid-template-columns: 1fr;
  }

  .pet-preview-stage {
    width: 100%;
    height: 96px;
  }

  .pet-actions {
    justify-content: flex-start;
  }

  .catalog-preview-stage {
    width: 100%;
    height: 80px;
  }
}

@media (max-width: 640px) {
  .pet-page {
    padding: 12px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
