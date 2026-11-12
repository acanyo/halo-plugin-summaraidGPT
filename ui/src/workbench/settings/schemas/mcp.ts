export default [
  {
    $formkit: 'switch',
    name: 'enabled',
    label: '启用 MCP 外部工具',
    value: false,
    help: '连接外部搜索、文档或业务服务，让助手在聊天时使用你开放的工具。需同时启用 Agent 能力。',
  },
  {
    $formkit: 'hidden',
    id: 'summaraidgpt-mcp-servers',
    name: 'servers',
    value: [],
  },
]
