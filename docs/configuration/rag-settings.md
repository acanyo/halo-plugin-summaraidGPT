# 知识库设置

配置组：`rag`

知识库设置用于控制 RAG 的内容切分、索引、召回、精排和多轮会话上下文。它直接影响知识库构建速度、检索准确率和模型回答成本。

## 基础开关

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 启用 RAG 知识库 | `enableRag` | `true` | 开启后可以导入公开文章，并通过知识库问答接口使用 RAG。 |

关闭后，知识库相关功能将不可用或不再参与前台问答。

## 内容分块

| 配置项 | 字段 | 默认值 | 范围 | 说明 |
| --- | --- | --- | --- | --- |
| 分块大小 | `chunkSize` | `900` | `200-3000` | 按字符近似切分内容。中文站点建议 `600-1200`。 |
| 分块重叠 | `chunkOverlap` | `120` | `0-800` | 相邻分块保留少量重叠，降低语义断裂。 |

### 配置建议

- 文章较短、结构清晰：`chunkSize` 可设为 `800-1000`。
- 长文较多、上下文关联强：`chunkOverlap` 可设为 `100-200`。
- 内容噪声较多时，不建议把分块设置得过大，否则召回结果会包含太多无关内容。

## 索引批量

| 配置项 | 字段 | 默认值 | 范围 | 说明 |
| --- | --- | --- | --- | --- |
| 索引文档批量大小 | `indexDocumentBatchSize` | `8` | `1-50` | 重建索引时每批送入 Embedding 阶段的文档数量。 |

### 配置建议

- 普通站点可以使用默认值 `8`。
- 模型较慢或经常超时，建议调小到 `5` 或更低。
- 文档很多且模型稳定时，可以适当调大，但要观察 AI 基座超时和内存压力。

## Embedding 调用

| 配置项 | 字段 | 默认值 | 范围 | 说明 |
| --- | --- | --- | --- | --- |
| Embedding 批量大小 | `embeddingCallSetting.embeddingBatchSize` | `1` | `1-64` | 每次请求 AI 基座 Embedding 的分块数量。 |
| Embedding 并发请求 | `embeddingCallSetting.embeddingParallelCalls` | `1` | `1-8` | 同时调用 Embedding 的批次数。 |
| Embedding 重试次数 | `embeddingCallSetting.embeddingMaxRetries` | `0` | `0-5` | 单批请求失败后的重试次数。 |
| Embedding 单批超时 | `embeddingCallSetting.embeddingTimeoutSeconds` | `180` | `30-1800` | 单批 Embedding 调用的超时时间，单位秒。 |

### 超时场景建议

- OpenAI 兼容模型或远程模型较慢时，保持 `embeddingBatchSize = 1`。
- 自部署模型吞吐不稳定时，保持 `embeddingParallelCalls = 1`。
- 频繁超时时，不要先增加重试次数，优先调小批量或调大超时时间。
- 重试会拉长整体索引耗时，适合偶发失败，不适合长期超时。

## 混合检索与精排

| 配置项 | 字段 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 启用混合检索 | `enableHybridSearch` | `true` | 同时使用向量召回和 Lucene BM25 关键词召回，再用 RRF 融合。 |
| 向量召回数量 | `vectorTopK` | `20` | 向量检索召回的候选数量。 |
| 关键词召回数量 | `keywordTopK` | `20` | 关键词检索召回的候选数量。 |
| 启用 Rerank 精排 | `enableRerank` | `true` | 使用 Rerank 模型对召回片段重排，失败时回退到混合检索顺序。 |
| 精排后上下文数量 | `rerankTopN` | `8` | 精排后送入模型的片段数量。 |
| 最大上下文字符数 | `maxContextCharacters` | `12000` | 检索资料进入模型的最大字符预算。 |

### 配置建议

- 内容标题、关键词明确：保持混合检索开启。
- 没有 Rerank 模型：可以关闭 `enableRerank`，系统会使用召回顺序。
- 回答经常缺少关键信息：适当提高 `vectorTopK`、`keywordTopK` 或 `rerankTopN`。
- 成本或响应时间过高：降低 `rerankTopN` 和 `maxContextCharacters`。

## 多轮会话上下文

| 配置项 | 字段 | 默认值 | 范围 | 说明 |
| --- | --- | --- | --- | --- |
| 会话上下文消息数 | `conversationMaxMessages` | `12` | `0-40` | 每次问答最多带入最近多少条历史消息。设为 `0` 表示不带入历史。 |
| 会话上下文字符数 | `conversationMaxContextCharacters` | `4000` | `0-30000` | 历史对话进入模型的字符预算。设为 `0` 表示不带入历史。 |

### 配置建议

- 前台助手以单轮问答为主：可降低到 `4-8`。
- 访客经常连续追问：保持默认 `12`。
- 模型上下文较小或成本敏感：降低字符预算。

## 增量索引说明

导入文章或文档后，可以只索引本次新增内容，不需要每次全量重建。全量重建更适合以下场景：

- 更换 Embedding 模型。
- 大幅调整分块大小或分块重叠。
- 怀疑索引数据不一致，需要整体刷新。

## 推荐方案

### 稳定优先

```text
indexDocumentBatchSize = 5
embeddingBatchSize = 1
embeddingParallelCalls = 1
embeddingMaxRetries = 0
embeddingTimeoutSeconds = 180-600
```

### 质量优先

```text
enableHybridSearch = true
enableRerank = true
vectorTopK = 20-40
keywordTopK = 20-40
rerankTopN = 8-12
```
