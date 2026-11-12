export default [
  {
    $formkit: 'switch',
    name: 'enable',
    label: '启用热词注释',
    value: false,
    help: '在文章正文中标记难懂的词语，读者悬停、点击或通过键盘聚焦即可查看解释。',
  },
  {
    $formkit: 'switch',
    name: 'autoGenerate',
    label: '访问文章时自动生成',
    value: true,
    help: '开启后在后台自动识别并保存热词；正文更新后重新生成。关闭后可在热词注释页面手动生成。使用 AI 设置中的摘要模型。',
  },
  {
    $formkit: 'number',
    name: 'maxTerms',
    label: '每篇最多解释词数',
    value: 8,
    min: 1,
    max: 15,
    validation: 'required|number|between:1,15',
    help: '建议 5–8 个。AI 会跳过常见词；没有难懂词语时不会强行生成。每个词只在正文首次出现时标记，代码与链接保持原样。',
  },
]
