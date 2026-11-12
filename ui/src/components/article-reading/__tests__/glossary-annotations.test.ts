// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { annotateTerms, termPosition } from '../../../../../packages/src/article-glossary/annotate'

describe('contextual glossary annotations', () => {
  it('matches Latin word boundaries and Chinese prose', () => {
    expect(termPosition('RAGged uses RAG.', 'RAG')).toBe(12)
    expect(termPosition('今天使用向量索引查找内容', '向量索引')).toBe(4)
    expect(termPosition('RAGged', 'RAG')).toBe(-1)
  })

  it('only marks the first safe prose occurrence and preserves HTML and visible text', () => {
    const root = document.createElement('article')
    root.innerHTML =
      '<h2>RAG</h2><a href="/rag">RAG</a><pre><code>RAG</code></pre>' +
      '<p>RAG 使用向量索引，RAG 可以辅助阅读。</p><p>向量索引</p><input value="RAG">'
    const original = root.textContent
    const terms = [
      { term: 'RAG', explanation: '检索增强生成。' },
      { term: '向量索引', explanation: '查找语义相关内容。' },
    ]
    expect(annotateTerms(root, terms)).toBe(2)
    expect(root.querySelectorAll('likcc-article-term')).toHaveLength(2)
    expect(root.querySelector('a')?.innerHTML).toBe('RAG')
    expect(root.querySelector('code')?.innerHTML).toBe('RAG')
    expect(root.textContent).toBe(original)
    expect(annotateTerms(root, terms)).toBe(0)
  })

  it('prefers a longer overlapping term and renders explanation as data', () => {
    const root = document.createElement('article')
    root.textContent = '向量索引辅助检索。'
    annotateTerms(root, [
      { term: '向量', explanation: '数值。' },
      { term: '向量索引', explanation: '<img src=x onerror=alert(1)>' },
    ])
    expect(root.querySelector('likcc-article-term')?.textContent).toBe('向量索引')
    expect(root.querySelector('img')).toBeNull()
  })
})
