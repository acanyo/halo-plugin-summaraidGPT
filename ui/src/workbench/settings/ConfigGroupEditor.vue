<script setup lang="ts">
import { computed } from 'vue'
import { submitForm } from '@formkit/vue'
import { VLoading } from '@halo-dev/components'
import WorkbenchIcon from '../components/WorkbenchIcon.vue'
import { settingGroupDetails, type SettingGroupId, type SettingsField } from './groups'
import { settingSections } from './sections'
import { useWorkbenchSettings } from './useWorkbenchSettings'
import LinguiSummarySettings from './LinguiSummarySettings.vue'

const props = defineProps<{ groupName: SettingGroupId; fields?: string[] }>()
const emit = defineEmits<{ saved: [] }>()
const {
  formId,
  group,
  values,
  loading,
  loaded,
  saving,
  syncing,
  error,
  dirty,
  configured,
  savedAt,
  canManage,
  load,
  save,
  syncSummaries,
  applyDefaultPrompts,
  discardChanges,
} = useWorkbenchSettings(() => props.groupName)
function nativeSchema(fields: SettingsField[]) {
  return props.groupName === 'style'
    ? fields.filter((field) => field.name !== 'linguiProjectId')
    : fields
}
const showLinguiSettings = computed(
  () => props.groupName === 'style' && (!props.fields || props.fields.includes('linguiProjectId')),
)
const schema = computed(() =>
  nativeSchema(
    props.fields
      ? group.value.formSchema.filter((field) => props.fields!.includes(field.name || ''))
      : group.value.formSchema,
  ),
)
const sections = computed(() =>
  settingSections(props.groupName).map((section) => ({
    ...section,
    schema: nativeSchema(section.schema),
  })),
)

async function submit(values: Record<string, unknown>) {
  const updates = props.fields
    ? Object.fromEntries(Object.entries(values).filter(([name]) => props.fields!.includes(name)))
    : values
  if (await save(updates)) emit('saved')
}
</script>

<template>
  <div v-if="error" class="sw-notice" role="alert">
    <WorkbenchIcon name="info" :size="17" /><span>{{ error }}</span>
    <button v-if="!loaded" type="button" class="sw-text-button" @click="load">重新加载</button>
  </div>
  <VLoading v-if="loading" />
  <section v-else-if="loaded" class="sw-settings-panel" :aria-labelledby="`${formId}-title`">
    <header class="sw-settings-heading">
      <div>
        <h2 :id="`${formId}-title`">{{ group.label }}</h2>
        <p>{{ settingGroupDetails[group.group]?.description }}</p>
      </div>
      <span class="sw-unsaved"
        ><span class="sw-status-dot" :class="{ 'is-ready': !dirty && configured }" />{{
          dirty ? '未保存' : configured ? '已同步' : '默认配置'
        }}</span
      >
    </header>
    <p v-if="!canManage" class="sw-readonly-note">
      当前账号可以查看设置。修改设置需要插件管理权限。
    </p>
    <div v-if="group.group === 'roles' && canManage" class="sw-settings-action">
      <div>
        <strong>使用内置角色设定</strong>
        <p>填入当前版本的提示词后，保存设置即可生效。</p>
      </div>
      <button type="button" class="sw-button" :disabled="saving" @click="applyDefaultPrompts">
        填入提示词
      </button>
    </div>
    <FormKit
      :id="formId"
      type="form"
      :value="values"
      :actions="false"
      :disabled="!canManage || saving"
      dirty-behavior="compare"
      form-class="sw-settings-form"
      @submit="submit"
    >
      <FormKitSchema v-if="fields" :schema="schema" :data="values" />
      <LinguiSummarySettings v-if="fields && showLinguiSettings" />
      <section
        v-for="section in fields ? [] : sections"
        :key="section.id"
        class="sw-settings-section"
        :aria-labelledby="`${formId}-${section.id}`"
      >
        <header>
          <h3 :id="`${formId}-${section.id}`">{{ section.title }}</h3>
          <p v-if="section.description">{{ section.description }}</p>
        </header>
        <div class="sw-settings-section-fields">
          <FormKitSchema :schema="section.schema" :data="values" />
          <LinguiSummarySettings
            v-if="showLinguiSettings && section.fields.includes('linguiProjectId')"
          />
        </div>
      </section>
    </FormKit>
    <div
      v-if="!fields && (group.group === 'summary' || group.group === 'basic')"
      class="sw-settings-action is-secondary"
    >
      <div>
        <strong>同步历史文章摘要</strong>
        <p>使用已配置的模型，为站点文章生成摘要。</p>
      </div>
      <button
        v-if="canManage"
        type="button"
        class="sw-button"
        :disabled="syncing"
        @click="syncSummaries"
      >
        {{ syncing ? '正在启动…' : '同步摘要' }}<WorkbenchIcon name="arrow" :size="14" />
      </button>
    </div>
    <footer class="sw-settings-footer">
      <span role="status">{{
        !canManage
          ? '只读模式'
          : dirty
            ? '有未保存的修改'
            : savedAt
              ? '设置已保存'
              : configured
                ? '所有修改已同步'
                : '当前使用默认值，保存后生效'
      }}</span>
      <div class="sw-settings-save-actions">
        <button
          v-if="canManage && dirty"
          type="button"
          class="sw-text-button"
          :disabled="saving"
          @click="discardChanges"
        >
          撤销修改
        </button>
        <button
          v-if="canManage"
          type="button"
          class="sw-button is-primary"
          :disabled="saving || (!dirty && configured)"
          @click="submitForm(formId)"
        >
          <WorkbenchIcon v-if="saving" name="refresh" :size="15" class="is-spinning" />{{
            saving ? '保存中…' : '保存设置'
          }}
        </button>
      </div>
    </footer>
  </section>
</template>
