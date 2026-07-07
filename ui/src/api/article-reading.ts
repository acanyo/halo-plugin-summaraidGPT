import { axiosInstance, consoleApiClient, type ListedPost } from '@halo-dev/api-client'

const API_PREFIX = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1'

export interface ArticleReadingMetadata {
  name?: string
  creationTimestamp?: string
}

export type InsightNodeKind = 'root' | 'tl' | 'dl'
export type InsightEdgeType = 'contains' | 'expands' | 'supports' | 'explains'

export interface InsightPayload {
  items?: string[]
}

export interface SourceRange {
  startParagraph?: number
  endParagraph?: number
  anchor?: string
}

export interface InsightNode {
  id: string
  title: string
  kind: InsightNodeKind
  summary?: string
  sourceRange?: SourceRange
  payload?: InsightPayload
}

export interface InsightEdge {
  from: string
  to: string
  type: InsightEdgeType
}

export interface ArticleReadingSpec {
  postMetadataName?: string
  postTitle?: string
  postUrl?: string
  contentHash?: string
  schemaVersion?: number
  modelName?: string
  generatedAt?: string
  root?: InsightNode
  nodes?: InsightNode[]
  edges?: InsightEdge[]
}

export interface ArticleReading {
  metadata?: ArticleReadingMetadata
  spec?: ArticleReadingSpec
}

export interface ErrorResponse {
  success?: boolean
  message?: string
}

export interface SelectablePost {
  name: string
  title: string
  slug?: string
  permalink?: string
  phase?: string
  published?: boolean
  publishTime?: string
  updatedAt?: string
}

export interface SelectablePostPage {
  items: SelectablePost[]
  page: number
  size: number
  total: number
}

export interface ListSelectablePostsParams {
  page?: number
  size?: number
  keyword?: string
}

const toSelectablePost = (item: ListedPost): SelectablePost | undefined => {
  const post = item.post
  const name = post.metadata?.name
  if (!name || post.spec?.deleted) {
    return undefined
  }
  return {
    name,
    title: post.spec?.title || name,
    slug: post.spec?.slug,
    permalink: post.status?.permalink,
    phase: post.status?.phase,
    published: post.spec?.publish,
    publishTime: post.spec?.publishTime,
    updatedAt: post.status?.lastModifyTime || post.metadata?.creationTimestamp || undefined,
  }
}

const isSelectablePost = (post?: SelectablePost): post is SelectablePost => Boolean(post)

export const articleReadingApi = {
  async listSelectablePosts(params: ListSelectablePostsParams = {}) {
    const keyword = params.keyword?.trim()
    const { data } = await consoleApiClient.content.post.listPosts({
      page: params.page || 1,
      size: params.size || 10,
      keyword: keyword || undefined,
      sort: ['metadata.creationTimestamp,desc'],
    })
    return {
      items: (data.items || []).map(toSelectablePost).filter(isSelectablePost),
      page: data.page || params.page || 1,
      size: data.size || params.size || 10,
      total: data.total || 0,
    } satisfies SelectablePostPage
  },

  async get(postName: string) {
    const { data } = await axiosInstance.get<ArticleReading | ErrorResponse>(
      `${API_PREFIX}/articleReadings/${encodeURIComponent(postName)}`,
    )
    if (!('spec' in data) || !data.spec) {
      throw new Error((data as ErrorResponse).message || '洞察图谱尚未生成')
    }
    return data as ArticleReading
  },

  async generate(postName: string, refresh = true) {
    const { data } = await axiosInstance.post<ArticleReading | ErrorResponse>(
      `${API_PREFIX}/articleReadings`,
      {
        postName,
        refresh,
      },
    )
    if (!('spec' in data) || !data.spec) {
      throw new Error((data as ErrorResponse).message || '洞察图谱生成失败')
    }
    return data as ArticleReading
  },
}
