import { axiosInstance } from '@halo-dev/api-client'

export interface ArticleGlossary {
  spec: {
    postName: string
    postTitle: string
    generatedAt: string
    terms: { term: string; explanation: string }[]
  }
}
const path = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1/articleGlossaries'
export const articleGlossaryApi = {
  async get(postName: string): Promise<ArticleGlossary | undefined> {
    const response = await axiosInstance.get<ArticleGlossary>(
      `${path}/${encodeURIComponent(postName)}`,
    )
    return response.status === 204 ? undefined : response.data
  },
  async generate(postName: string) {
    const { data } = await axiosInstance.post<ArticleGlossary>(
      path,
      { postName, refresh: true },
      { timeout: 110000 },
    )
    return data
  },
}
