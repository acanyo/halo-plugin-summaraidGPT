<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { hasUiPermission } from '@/utils/permissions'
import WorkbenchIcon from '../components/WorkbenchIcon.vue'
import WorkbenchSectionHeader from '../components/WorkbenchSectionHeader.vue'
import ConfigGroupEditor from '../settings/ConfigGroupEditor.vue'
import { workbenchLocation } from '../navigation'
import { useWorkbenchOverview } from '../overview/useWorkbenchOverview'
import { guideSteps } from './steps'

const route = useRoute()
const router = useRouter()
const { config, knowledgeBases, importedDocuments, readyKnowledgeBases, loading, errors, load } =
  useWorkbenchOverview({ activity: false })
const stepIndex = computed(() =>
  Math.max(
    0,
    guideSteps.findIndex((step) => step.id === route.query.step),
  ),
)
const step = computed(() => guideSteps[stepIndex.value]!)
const canConfigure = computed(() => hasUiPermission('system:plugins:view'))
const canKnowledge = computed(() => hasUiPermission('plugin:summaraidGPT:rag:view'))
const complete = computed(() => [
  Boolean(config.value?.basic),
  Boolean(importedDocuments.value),
  Boolean(readyKnowledgeBases.value?.length),
  config.value?.assistant?.enableAssistant === true,
])
const captions = computed(() => [
  config.value
    ? config.value.basic
      ? '模型偏好已保存'
      : '选择模型或沿用基座默认'
    : '待确认模型设置',
  importedDocuments.value === undefined
    ? '待确认导入状态'
    : `已导入 ${importedDocuments.value} 份内容`,
  knowledgeBases.value
    ? `${readyKnowledgeBases.value?.length || 0} 个知识库已就绪`
    : '待确认索引状态',
  config.value?.assistant?.enableAssistant === true ? '助手已开启' : '设置并保存助手入口',
  '打开站点进行真实体验',
])
function selectStep(index: number) {
  void router.push(workbenchLocation('guide', { step: guideSteps[index]!.id }))
}
</script>

<template>
  <WorkbenchSectionHeader
    title="跟着步骤，让助手开始工作。"
    description="从模型选择到前台体验，在这里完成首次配置。随时可以回到这份引导继续。"
  >
    <template #actions>
      <button type="button" class="sw-button" :disabled="loading" @click="load">
        <WorkbenchIcon name="refresh" :size="15" :class="{ 'is-spinning': loading }" />{{
          loading ? '检查中…' : '刷新进度'
        }}
      </button>
    </template>
  </WorkbenchSectionHeader>
  <div v-if="errors.length" class="sw-notice" role="alert">
    <WorkbenchIcon name="info" :size="17" />
    <div>
      <p v-for="error in errors" :key="error">{{ error }}</p>
    </div>
  </div>
  <div class="sw-guide-layout">
    <nav class="sw-guide-nav" aria-label="首次设置步骤">
      <span class="sw-eyebrow">{{
        loading ? '检查配置中' : `${complete.filter(Boolean).length} / 4 项已准备`
      }}</span>
      <button
        v-for="(item, index) in guideSteps"
        :key="item.id"
        type="button"
        class="sw-guide-step"
        :class="{ 'is-current': step.id === item.id }"
        :aria-current="step.id === item.id ? 'step' : undefined"
        @click="selectStep(index)"
      >
        <span class="sw-step-number" :class="{ 'is-complete': complete[index] }"
          ><WorkbenchIcon v-if="complete[index]" name="check" :size="16" /><span v-else>{{
            index + 1
          }}</span></span
        >
        <span
          ><strong>{{ item.title }}</strong
          ><small>{{ captions[index] }}</small></span
        >
      </button>
      <p>进度来自已保存的配置与知识库状态。模型连通性和实际回答效果，请通过测试确认。</p>
    </nav>
    <section class="sw-guide-content" aria-labelledby="sw-guide-heading">
      <header class="sw-guide-heading">
        <span class="sw-eyebrow">步骤 {{ stepIndex + 1 }} / {{ guideSteps.length }}</span>
        <h2 id="sw-guide-heading">{{ step.heading }}</h2>
        <p>{{ step.description }}</p>
      </header>
      <ol class="sw-guide-instructions">
        <li v-for="instruction in step.instructions" :key="instruction">{{ instruction }}</li>
      </ol>
      <div class="sw-guide-actions">
        <RouterLink v-if="step.id === 'models'" to="/ai-foundation" class="sw-button"
          >打开 AI 基座<WorkbenchIcon name="arrow" :size="15"
        /></RouterLink>
        <RouterLink
          v-if="(step.id === 'content' || step.id === 'index') && canKnowledge"
          :to="workbenchLocation('knowledge', { guide: step.id })"
          class="sw-button is-primary"
          >{{ step.id === 'content' ? '创建知识库与导入内容' : '构建索引与测试问答'
          }}<WorkbenchIcon name="arrow" :size="15"
        /></RouterLink>
        <RouterLink
          v-if="step.id === 'index' && hasUiPermission('plugin:summaraidGPT:ai-call-logs:view')"
          :to="workbenchLocation('logs', { guide: 'index' })"
          class="sw-text-button"
          >查看调用日志</RouterLink
        >
        <RouterLink
          v-if="step.id === 'assistant' && hasUiPermission('plugin:summaraidGPT:pets:view')"
          :to="workbenchLocation('assistant', { guide: 'assistant' })"
          class="sw-button"
          >选择助手形象<WorkbenchIcon name="arrow" :size="15"
        /></RouterLink>
        <a
          v-if="step.id === 'finish'"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          class="sw-button is-primary"
          >打开站点体验<WorkbenchIcon name="external" :size="15"
        /></a>
        <RouterLink
          v-if="step.id === 'finish'"
          :to="workbenchLocation('overview')"
          class="sw-button"
          >进入概览</RouterLink
        >
      </div>
      <p v-if="(step.id === 'content' || step.id === 'index') && !canKnowledge" class="sw-notice">
        当前账号没有知识库查看权限，请联系管理员完成此步骤。
      </p>
      <ConfigGroupEditor
        v-if="step.id === 'models' && canConfigure"
        key="basic"
        group-name="basic"
        :fields="['languageModelName', 'vectorModelSetting']"
        @saved="load"
      />
      <ConfigGroupEditor
        v-if="step.id === 'assistant' && canConfigure"
        key="assistant"
        group-name="assistant"
        :fields="[
          'enableAssistant',
          'displayMode',
          'assistantName',
          'welcomeMessage',
          'quickQuestions',
          'assistantAvatar',
        ]"
        @saved="load"
      />
      <p
        v-if="(step.id === 'models' || step.id === 'assistant') && !canConfigure"
        class="sw-notice"
      >
        当前账号没有插件设置查看权限，请联系管理员配置。
      </p>
      <div v-if="step.id === 'assistant' && canConfigure" class="sw-guide-actions">
        <RouterLink
          :to="workbenchLocation('settings', { group: 'basic', guide: 'assistant' })"
          class="sw-text-button"
          >设置访客访问模式</RouterLink
        ><RouterLink
          :to="workbenchLocation('settings', { group: 'rag', guide: 'assistant' })"
          class="sw-text-button"
          >调整知识库能力</RouterLink
        >
      </div>
      <footer class="sw-guide-footer">
        <button
          type="button"
          class="sw-button"
          :disabled="stepIndex === 0"
          @click="selectStep(stepIndex - 1)"
        >
          上一步</button
        ><span>{{ stepIndex < 4 ? '本步修改请先保存，再继续。' : '配置完成后仍可随时调整。' }}</span
        ><button
          v-if="stepIndex < 4"
          type="button"
          class="sw-button is-primary"
          @click="selectStep(stepIndex + 1)"
        >
          下一步<WorkbenchIcon name="arrow" :size="15" /></button
        ><RouterLink v-else :to="workbenchLocation('overview')" class="sw-button is-primary"
          >完成，进入概览</RouterLink
        >
      </footer>
    </section>
  </div>
</template>
