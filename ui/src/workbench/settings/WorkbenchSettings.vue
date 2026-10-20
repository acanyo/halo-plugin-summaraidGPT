<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import WorkbenchIcon from '../components/WorkbenchIcon.vue'
import WorkbenchSectionHeader from '../components/WorkbenchSectionHeader.vue'
import { workbenchLocation } from '../navigation'
import { getSettingGroup, settingGroups, settingGroupDetails } from './groups'
import { settingsCategories } from './sections'
import ConfigGroupEditor from './ConfigGroupEditor.vue'
import LegacyMigrationPanel from './migration/LegacyMigrationPanel.vue'

const route = useRoute()
const search = ref('')
const migrating = computed(() => route.query.group === 'migration')
const group = computed(() => getSettingGroup(route.query.group))
const categories = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return settingsCategories
    .map((category) => ({
      ...category,
      forms: settingGroups.filter(
        (form) =>
          (category.groups as readonly string[]).includes(form.group) &&
          (!keyword ||
            `${form.label} ${settingGroupDetails[form.group]?.description} ${JSON.stringify(form.formSchema.map((field) => [field.label, field.children?.map((child) => child.label)]))}`
              .toLowerCase()
              .includes(keyword)),
      ),
    }))
    .filter((category) => category.forms.length)
})
</script>

<template>
  <WorkbenchSectionHeader title="设置" description="让模型、内容和助手，按你的方式工作。">
    <template #actions
      ><RouterLink :to="workbenchLocation('settings', { group: 'migration' })" class="sw-button"
        ><WorkbenchIcon name="transfer" :size="15" />迁移旧设置</RouterLink
      ><RouterLink :to="workbenchLocation('guide')" class="sw-text-button"
        >使用引导<WorkbenchIcon name="arrow" :size="14" /></RouterLink
    ></template>
  </WorkbenchSectionHeader>
  <div class="sw-settings-layout">
    <aside class="sw-settings-sidebar">
      <label class="sw-settings-search"
        ><WorkbenchIcon name="search" :size="15" /><input
          v-model="search"
          type="search"
          aria-label="搜索设置"
          placeholder="搜索设置…"
      /></label>
      <nav class="sw-settings-nav" aria-label="设置分类">
        <div v-for="category in categories" :key="category.label" class="sw-settings-category">
          <span class="sw-settings-category-label">{{ category.label }}</span
          ><RouterLink
            v-for="form in category.forms"
            :key="form.group"
            :to="workbenchLocation('settings', { group: form.group })"
            :class="{ 'is-active': !migrating && group.group === form.group }"
            :aria-current="!migrating && group.group === form.group ? 'page' : undefined"
            ><WorkbenchIcon
              :name="settingGroupDetails[form.group]?.icon || 'settings'"
              :size="16" /><span>{{ form.label }}</span
            ><WorkbenchIcon
              v-if="!migrating && group.group === form.group"
              name="chevron"
              :size="12"
          /></RouterLink>
        </div>
        <p v-if="!categories.length" class="sw-settings-no-results">
          没有匹配的设置分类。<button type="button" class="sw-text-button" @click="search = ''">
            清除搜索
          </button>
        </p>
        <RouterLink
          :to="workbenchLocation('settings', { group: 'migration' })"
          class="sw-settings-migration-link"
          :class="{ 'is-active': migrating }"
          :aria-current="migrating ? 'page' : undefined"
          ><WorkbenchIcon name="transfer" :size="16" /><span>旧设置迁移</span></RouterLink
        >
      </nav>
      <p class="sw-settings-sidebar-note">每个分类单独保存。旧配置可直接读取，无需重新填写。</p>
    </aside>
    <LegacyMigrationPanel v-if="migrating" />
    <ConfigGroupEditor v-else :key="group.group" :group-name="group.group" />
  </div>
</template>
