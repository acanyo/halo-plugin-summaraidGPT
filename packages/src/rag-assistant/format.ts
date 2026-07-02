import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: false,
  typographer: false,
});

const defaultLinkOpenRenderer = markdown.renderer.rules.link_open
  ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const href = token.attrGet('href');
  if (href && !markdown.validateLink(href)) {
    token.attrSet('href', '');
  }
  token.attrSet('target', '_blank');
  token.attrSet('rel', 'noopener noreferrer');
  return defaultLinkOpenRenderer(tokens, idx, options, env, self);
};

export function formatTime(date = new Date()): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function markdownToHtml(markdownText: string): string {
  return markdown.render(normalizeAssistantMarkdown(markdownText));
}

function normalizeAssistantMarkdown(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/([^\n])---(?=#{1,6})/g, '$1\n\n---\n\n')
    .replace(/(^|\n)---(?=#{1,6})/g, '$1---\n\n')
    .replace(/([^\n#])(#{1,6})(?=[^\s#])/g, '$1\n\n$2')
    .replace(/(^|\n)(#{1,6})(?=[^\s#])/g, '$1$2 ')
    .replace(/([:：])-(?=(?:\*\*|【|[\p{L}\p{N}]))/gu, '$1\n- ')
    .replace(/([^\n])-(?=\*\*)/g, '$1\n- ')
    .replace(/(^|\n)-(?=\S)/g, '$1- ');
}
