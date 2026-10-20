<script setup lang="ts">
import { VLoading } from '@halo-dev/components'
import { utils } from '@halo-dev/ui-shared'
import WorkbenchIcon from '../../components/WorkbenchIcon.vue'
import { workbenchLocation } from '../../navigation'
import { useLegacyMigration } from './useLegacyMigration'

const {
  loading,
  loaded,
  saving,
  error,
  canManage,
  record,
  plan,
  load,
  migrate,
  undo,
  downloadBackup,
} = useLegacyMigration()
</script>

<template>
  <section
    class="sw-migration-panel"
    aria-labelledby="sw-migration-title"
    :aria-busy="loading || saving"
  >
    <header class="sw-settings-heading">
      <div>
        <span class="sw-eyebrow">兼容旧版</span>
        <h2 id="sw-migration-title">把旧设置接到新工作台</h2>
        <p>自动检查原插件配置，保留已有值，并补齐新版缺少的设置。</p>
      </div>
      <span class="sw-settings-emblem"><WorkbenchIcon name="transfer" :size="24" /></span>
    </header>
    <VLoading v-if="loading" />
    <div v-else class="sw-migration-body">
      <div v-if="error" class="sw-notice" role="alert">
        <WorkbenchIcon name="info" :size="17" /><span>{{ error }}</span
        ><button v-if="!saving" type="button" class="sw-text-button" @click="load">重新检查</button>
      </div>
      <template v-if="loaded">
        <div class="sw-migration-status" :class="{ 'is-complete': record }" role="status">
          <span class="sw-migration-status-icon"
            ><WorkbenchIcon :name="record ? 'check' : 'settings'" :size="20"
          /></span>
          <div>
            <strong>{{
              record
                ? '旧设置已迁移'
                : plan.detectedCount
                  ? `检测到 ${plan.detectedCount} 类已有配置`
                  : '没有检测到旧设置'
            }}</strong>
            <p>
              {{
                record
                  ? `完成于 ${utils.date.format(record.completedAt)}`
                  : plan.detectedCount
                    ? '现在即可在工作台继续编辑，迁移会为缺失项补齐默认配置。'
                    : '新安装无需迁移，可从使用引导开始配置。'
              }}
            </p>
          </div>
        </div>
        <p class="sw-migration-explanation">
          旧设置与工作台共用同一份站点配置。迁移不会覆盖已经保存的模型、提示词、开关或自定义值，也不会删除旧字段。
        </p>
        <div class="sw-migration-groups" aria-label="旧配置检查结果">
          <div v-for="group in plan.groups" :key="group.group">
            <span>{{ group.label }}</span
            ><small>{{ group.detected ? '已有配置' : '使用默认值' }}</small
            ><span class="sw-migration-group-status"
              ><WorkbenchIcon v-if="record || group.detected" name="check" :size="13" />{{
                record ? '已接入' : group.addedCount ? `补齐 ${group.addedCount} 项` : '保留原值'
              }}</span
            >
          </div>
        </div>
        <div class="sw-migration-backup">
          <WorkbenchIcon name="book" :size="17" />
          <div>
            <strong>保留迁移前备份</strong>
            <p>迁移完成后可下载原配置，也可撤销迁移补齐的值。后续手动修改会保留。</p>
          </div>
        </div>
      </template>
    </div>
    <footer v-if="loaded && !loading" class="sw-settings-footer">
      <template v-if="record"
        ><button type="button" class="sw-text-button" :disabled="saving" @click="downloadBackup">
          <WorkbenchIcon name="download" :size="15" />下载迁移前备份</button
        ><button v-if="canManage" type="button" class="sw-button" :disabled="saving" @click="undo">
          {{ saving ? '处理中…' : '撤销本次迁移' }}
        </button></template
      >
      <template v-else
        ><span>{{ !canManage ? '迁移需要插件管理权限' : '一键完成，原有配置自动保留' }}</span
        ><button
          v-if="canManage && plan.detectedCount"
          type="button"
          class="sw-button is-primary"
          :disabled="saving"
          @click="migrate"
        >
          <WorkbenchIcon
            :name="saving ? 'refresh' : 'transfer'"
            :size="15"
            :class="{ 'is-spinning': saving }"
          />{{ saving ? '正在迁移…' : '一键迁移旧设置' }}</button
        ><RouterLink
          v-else-if="!plan.detectedCount"
          :to="workbenchLocation('guide')"
          class="sw-button"
          >打开使用引导</RouterLink
        ></template
      >
    </footer>
  </section>
</template>
