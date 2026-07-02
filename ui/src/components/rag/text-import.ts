export type RagTextImportMode = 'MARKDOWN' | 'RICH_TEXT'

export interface RagTextImportFile {
  id: string
  mode: RagTextImportMode
  fileName: string
  fileSize: number
  title: string
  sourceName: string
  markdown: string
  richText: string
}

export interface RagTextImportForm {
  files: RagTextImportFile[]
}

export const createRagTextImportForm = (): RagTextImportForm => ({
  files: [],
})
