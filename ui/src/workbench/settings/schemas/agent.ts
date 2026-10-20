export default [
  {
    $formkit: 'switch',
    name: 'enabled',
    label: '启用站点操作 Agent',
    value: true,
    help: '开启后，前台宠物助手可以在白名单工具范围内搜索站内内容、打开可信页面、定位评论区和生成评论草稿。',
  },
  {
    $formkit: 'group',
    name: 'builtIn',
    label: '预设能力',
    value: {
      pageContext: true,
      haloNavigation: true,
      haloContentSearch: true,
      ragContentSearch: true,
      networkAccess: false,
      commentCapability: 'assist',
    },
    children: [
      {
        $formkit: 'switch',
        name: 'pageContext',
        label: '当前页面上下文',
        value: true,
        help: '允许模型读取当前页面标题、地址、选中文本、导航链接摘要和评论区状态。',
      },
      {
        $formkit: 'switch',
        name: 'haloNavigation',
        label: '打开可信页面',
        value: true,
        help: '允许模型打开 Halo 搜索、RAG 检索或当前页面上下文中返回过的可信链接。',
      },
      {
        $formkit: 'switch',
        name: 'haloContentSearch',
        label: 'Halo 内容搜索',
        value: true,
        help: '允许模型搜索公开文章、独立页面、分类和标签。',
      },
      {
        $formkit: 'switch',
        name: 'ragContentSearch',
        label: 'RAG 知识库检索',
        value: true,
        help: '允许模型检索本站 RAG 知识库并读取有限详情。',
      },
      {
        $formkit: 'switch',
        name: 'networkAccess',
        label: '后端网络访问',
        value: false,
        help: '允许模型读取白名单公网 URL。默认关闭，且会阻止 localhost、内网和链路本地地址。',
      },
      {
        $formkit: 'select',
        name: 'commentCapability',
        label: '评论能力',
        value: 'assist',
        help: '关闭：不开放评论工具。辅助：允许定位评论区和填写草稿。提交：访客确认后尝试提交评论。',
        options: [
          {
            label: '关闭',
            value: 'off',
          },
          {
            label: '辅助',
            value: 'assist',
          },
          {
            label: '提交',
            value: 'submit',
          },
        ],
      },
    ],
  },
  {
    $formkit: 'group',
    name: 'toolSecurity',
    label: '浏览器工具安全',
    value: {
      allowedExternalOrigins: [],
      allowNewTab: false,
    },
    children: [
      {
        $formkit: 'array',
        name: 'allowedExternalOrigins',
        label: '允许打开的外部站点',
        value: [],
        addLabel: '添加外部站点',
        emptyText: '暂无外部站点',
        help: '仅填写 Origin，例如 https://github.com。未配置时只允许打开本站链接。',
        itemLabels: [
          {
            type: 'text',
            label: '$value.origin',
          },
        ],
        children: [
          {
            $formkit: 'text',
            name: 'origin',
            label: 'Origin',
            placeholder: 'https://example.com',
          },
        ],
      },
      {
        $formkit: 'switch',
        name: 'allowNewTab',
        label: '允许新窗口打开',
        value: false,
      },
    ],
  },
  {
    $formkit: 'group',
    name: 'haloSearch',
    label: 'Halo 搜索',
    value: {
      allowedTypes: ['post.content.halo.run', 'singlepage.content.halo.run'],
      defaultLimit: 5,
    },
    children: [
      {
        $formkit: 'checkbox',
        name: 'allowedTypes',
        label: '允许搜索的内容类型',
        value: ['post.content.halo.run', 'singlepage.content.halo.run'],
        options: [
          {
            label: '文章',
            value: 'post.content.halo.run',
          },
          {
            label: '独立页面',
            value: 'singlepage.content.halo.run',
          },
          {
            label: '瞬间',
            value: 'moment.moment.halo.run',
          },
        ],
      },
      {
        $formkit: 'number',
        name: 'defaultLimit',
        label: '默认返回数量',
        value: 5,
        min: 1,
        max: 20,
      },
    ],
  },
  {
    $formkit: 'group',
    name: 'ragSearch',
    label: 'RAG 检索',
    value: {
      defaultLimit: 5,
      maxContentChars: 3000,
    },
    children: [
      {
        $formkit: 'number',
        name: 'defaultLimit',
        label: '默认返回数量',
        value: 5,
        min: 1,
        max: 20,
      },
      {
        $formkit: 'number',
        name: 'maxContentChars',
        label: '单条详情最大字符数',
        value: 3000,
        min: 500,
        max: 10000,
      },
    ],
  },
  {
    $formkit: 'group',
    name: 'haloResourceDetail',
    label: 'Halo 资源详情',
    value: {
      maxContentChars: 3000,
    },
    children: [
      {
        $formkit: 'number',
        name: 'maxContentChars',
        label: '单条详情最大字符数',
        value: 3000,
        min: 500,
        max: 10000,
      },
    ],
  },
  {
    $formkit: 'group',
    name: 'networkAccess',
    label: '后端网络访问',
    value: {
      allowedOrigins: [],
      maxResponseChars: 4000,
      timeoutSeconds: 5,
    },
    children: [
      {
        $formkit: 'array',
        name: 'allowedOrigins',
        label: '允许读取的 Origin',
        value: [],
        addLabel: '添加 Origin',
        emptyText: '暂无 Origin',
        help: '仅填写完整 Origin，例如 https://api.example.com。',
        itemLabels: [
          {
            type: 'text',
            label: '$value.origin',
          },
        ],
        children: [
          {
            $formkit: 'text',
            name: 'origin',
            label: 'Origin',
            placeholder: 'https://api.example.com',
          },
        ],
      },
      {
        $formkit: 'number',
        name: 'maxResponseChars',
        label: '最大响应字符数',
        value: 4000,
        min: 1000,
        max: 20000,
      },
      {
        $formkit: 'number',
        name: 'timeoutSeconds',
        label: '请求超时（秒）',
        value: 5,
        min: 1,
        max: 15,
      },
    ],
  },
  {
    $formkit: 'textarea',
    name: 'aiTools',
    label: '自定义浏览器工具 JSON',
    value: '[]',
    rows: 8,
    help: '高级选项。仅支持 navigate、scroll-to、highlight、dispatch-event、registered 这几类浏览器动作。',
  },
]
