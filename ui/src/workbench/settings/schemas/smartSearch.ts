export default [
  {
    $formkit: 'switch', name: 'enable', label: '启用智能搜索扩展', value: false,
    help: '在 Halo 官方搜索框中增加智能搜索与 AI 解答，保留原输入框、结果列表和布局。需启用官方搜索组件，保存后刷新前台页面生效。',
  },
  {
    $formkit: 'switch', name: 'enableSemantic', label: '启用智能搜索', value: true,
    help: '点击后使用知识库检索相关文章，输入时不调用模型。需先导入公开文章并完成索引。失败或无匹配时回退到关键词搜索。',
  },
  {
    $formkit: 'switch', name: 'enableAi', label: '启用 AI 解答', value: true,
    help: '读者点击后才生成回答，使用知识库问答模型；遵循 AI 设置中的登录限制、来源校验和限流。',
  },
]
