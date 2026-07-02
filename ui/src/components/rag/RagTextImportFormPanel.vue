<script setup lang="ts">
import { computed, ref } from 'vue'
import RiCloseLine from '~icons/ri/close-line'
import RiFileTextLine from '~icons/ri/file-text-line'
import RiUploadCloud2Line from '~icons/ri/upload-cloud-2-line'
import type { RagTextImportFile, RagTextImportForm, RagTextImportMode } from './text-import'

const form = defineModel<RagTextImportForm>({ required: true })

const fileInput = ref<HTMLInputElement>()
const dragging = ref(false)

const acceptedFileTypes = '.md,.markdown,.txt,.html,.htm,text/markdown,text/plain,text/html'

const fileCountText = computed(() => {
  const count = form.value.files.length
  return count > 0 ? `已选择 ${count} 个文件` : '可多选或拖拽多个文件'
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const importFromInput = async (event: Event) => {
  const input = event.target as HTMLInputElement
  await importFiles(input.files)
  input.value = ''
}

const importFromDrop = async (event: DragEvent) => {
  dragging.value = false
  await importFiles(event.dataTransfer?.files)
}

const importFiles = async (fileList?: FileList | null) => {
  const files = Array.from(fileList || []).filter(isSupportedFile)
  if (files.length === 0) {
    return
  }

  const existingNames = new Set(form.value.files.map((file) => file.sourceName))
  const importedFiles = []
  for (const file of files) {
    const importedFile = await toImportFile(file, existingNames)
    existingNames.add(importedFile.sourceName)
    importedFiles.push(importedFile)
  }
  form.value.files = [...form.value.files, ...importedFiles]
}

const toImportFile = async (file: File, existingNames: Set<string>): Promise<RagTextImportFile> => {
  const content = await file.text()
  const mode = resolveFileMode(file)
  const title = fileTitle(file.name)
  const sourceName = uniqueSourceName(title, existingNames)
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${Math.random()}`,
    mode,
    fileName: file.name,
    fileSize: file.size,
    title,
    sourceName,
    markdown: mode === 'MARKDOWN' ? content : '',
    richText: mode === 'RICH_TEXT' ? sanitizeHtml(content) : '',
  }
}

const removeFile = (id: string) => {
  form.value.files = form.value.files.filter((file) => file.id !== id)
}

const clearFiles = () => {
  form.value.files = []
}

const isSupportedFile = (file: File) =>
  /\.(md|markdown|txt|html?)$/i.test(file.name) ||
  ['text/markdown', 'text/plain', 'text/html'].includes(file.type)

const resolveFileMode = (file: File): RagTextImportMode =>
  file.type === 'text/html' || /\.html?$/i.test(file.name) ? 'RICH_TEXT' : 'MARKDOWN'

const fileTitle = (fileName: string) =>
  fileName.replace(/\.(md|markdown|txt|html?)$/i, '').trim() || fileName

const uniqueSourceName = (title: string, existingNames: Set<string>) => {
  if (!existingNames.has(title)) {
    return title
  }

  let index = 2
  let candidate = `${title}-${index}`
  while (existingNames.has(candidate)) {
    index += 1
    candidate = `${title}-${index}`
  }
  return candidate
}

const fileSizeText = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

const contentText = (file: RagTextImportFile) =>
  file.mode === 'RICH_TEXT' ? htmlToPlainText(file.richText) : file.markdown

const fileMetaText = (file: RagTextImportFile) => {
  const text = contentText(file)
  const lines = text.split(/\r?\n/).filter((line) => line.trim()).length
  const chars = text.trim().length
  return `${fileSizeText(file.fileSize)} · ${lines} 行 · ${chars} 字`
}

const sanitizeHtml = (html: string) => {
  if (!html) {
    return ''
  }
  const parser = new DOMParser()
  const parsedDocument = parser.parseFromString(html, 'text/html')
  parsedDocument
    .querySelectorAll('script,style,noscript,iframe,svg,canvas,form,input,button')
    .forEach((node) => node.remove())
  parsedDocument.body.querySelectorAll('*').forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim().toLowerCase()
      if (name.startsWith('on') || value.startsWith('javascript:')) {
        node.removeAttribute(attribute.name)
      }
    })
  })
  return parsedDocument.body.innerHTML.trim()
}

const htmlToPlainText = (html: string) => {
  if (!html) {
    return ''
  }
  const parser = new DOMParser()
  const parsedDocument = parser.parseFromString(html, 'text/html')
  return parsedDocument.body.textContent || ''
}
</script>

<template>
  <div class=":uno: grid gap-4">
    <div
      role="button"
      tabindex="0"
      class=":uno: group grid min-h-[210px] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center transition-all hover:border-blue-400 hover:bg-blue-50/50"
      :class="{
        ':uno: border-blue-500 bg-blue-50 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]': dragging,
      }"
      @click="triggerFileInput"
      @keydown.enter.prevent="triggerFileInput"
      @keydown.space.prevent="triggerFileInput"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="importFromDrop"
    >
      <div class=":uno: flex flex-col items-center gap-3">
        <div
          class=":uno: grid h-12 w-12 place-items-center rounded-lg border border-blue-100 bg-white text-blue-600 shadow-sm transition-transform group-hover:-translate-y-0.5"
        >
          <RiUploadCloud2Line class=":uno: h-6 w-6" />
        </div>
        <div>
          <p class=":uno: m-0 text-sm font-semibold text-slate-900">上传文件</p>
          <p class=":uno: m-0 mt-1 text-xs text-slate-500">.md / .markdown / .txt / .html / .htm</p>
          <p class=":uno: m-0 mt-2 text-xs font-medium text-blue-600">
            {{ fileCountText }}
          </p>
        </div>
      </div>
    </div>

    <input
      ref="fileInput"
      class=":uno: hidden"
      type="file"
      multiple
      :accept="acceptedFileTypes"
      @change="importFromInput"
    />

    <div v-if="form.files.length > 0" class=":uno: grid gap-2">
      <div class=":uno: flex items-center justify-between gap-3">
        <span class=":uno: text-xs font-medium text-slate-500">待导入文件</span>
        <button
          type="button"
          class=":uno: rounded-md border-0 bg-transparent px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          @click="clearFiles"
        >
          清空
        </button>
      </div>

      <div class=":uno: grid max-h-[260px] gap-2 overflow-auto pr-1">
        <div
          v-for="file in form.files"
          :key="file.id"
          class=":uno: grid grid-cols-[36px_minmax(0,1fr)_max-content] items-center gap-3 rounded-lg border border-[#edf0f5] bg-white px-3 py-2"
        >
          <div class=":uno: grid h-9 w-9 place-items-center rounded-md bg-blue-50 text-blue-600">
            <RiFileTextLine class=":uno: h-4.5 w-4.5" />
          </div>
          <div class=":uno: min-w-0">
            <p class=":uno: m-0 truncate text-sm font-medium text-slate-900">
              {{ file.title }}
            </p>
            <p class=":uno: m-0 mt-0.5 truncate text-xs text-slate-500">
              {{ file.fileName }} · {{ file.mode === 'RICH_TEXT' ? '富文本' : 'Markdown' }} ·
              {{ fileMetaText(file) }}
            </p>
          </div>
          <button
            type="button"
            class=":uno: grid h-7 w-7 place-items-center rounded-md border-0 bg-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            @click="removeFile(file.id)"
          >
            <RiCloseLine class=":uno: h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
