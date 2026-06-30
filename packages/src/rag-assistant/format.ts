export function formatTime(date = new Date()): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const htmlParts: string[] = [];
  let paragraphLines: string[] = [];
  let unorderedItems: string[] = [];
  let orderedItems: string[] = [];
  let codeLines: string[] = [];
  let inCodeBlock = false;
  let codeLanguage = '';

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }
    htmlParts.push(`<p>${inlineMarkdown(paragraphLines.join('\n')).replace(/\n/g, '<br>')}</p>`);
    paragraphLines = [];
  };

  const flushUnorderedList = () => {
    if (!unorderedItems.length) {
      return;
    }
    htmlParts.push(`<ul>${unorderedItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
    unorderedItems = [];
  };

  const flushOrderedList = () => {
    if (!orderedItems.length) {
      return;
    }
    htmlParts.push(`<ol>${orderedItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ol>`);
    orderedItems = [];
  };

  const flushLists = () => {
    flushUnorderedList();
    flushOrderedList();
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const fenceMatch = line.match(/^```([A-Za-z0-9_-]*)\s*$/);
    if (fenceMatch) {
      if (inCodeBlock) {
        htmlParts.push(
          `<pre><code${codeLanguage ? ` class="language-${escapeAttribute(codeLanguage)}"` : ''}>${escapeHtml(codeLines.join('\n'))}</code></pre>`,
        );
        codeLines = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        flushParagraph();
        flushLists();
        inCodeBlock = true;
        codeLanguage = fenceMatch[1] || '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushLists();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushLists();
      const level = heading[1].length;
      htmlParts.push(`<h${level}>${inlineMarkdown(heading[2].trim())}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    if (unordered) {
      flushParagraph();
      flushOrderedList();
      unorderedItems.push(unordered[1]);
      continue;
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      flushUnorderedList();
      orderedItems.push(ordered[1]);
      continue;
    }

    const quote = line.match(/^>\s?(.+)$/);
    if (quote) {
      flushParagraph();
      flushLists();
      htmlParts.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }

    flushLists();
    paragraphLines.push(line);
  }

  if (inCodeBlock) {
    htmlParts.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  }
  flushParagraph();
  flushLists();

  return htmlParts.join('');
}

function inlineMarkdown(value: string): string {
  const codeSpans: string[] = [];
  let html = escapeHtml(value).replace(/`([^`]+)`/g, (_, code: string) => {
    const token = `@@CODE${codeSpans.length}@@`;
    codeSpans.push(`<code>${code}</code>`);
    return token;
  });

  html = html
    .replace(/\[([^\]]+)]\(([^)\s]+)\)/g, (_, label: string, href: string) => {
      const safeHref = sanitizeHref(href);
      return safeHref
        ? `<a href="${escapeAttribute(safeHref)}" target="_blank" rel="noopener noreferrer">${label}</a>`
        : label;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/(^|[\s>])\*{1,2}([\u4e00-\u9fa5A-Za-z0-9][^*\n：:]{0,18}[：:])/g, '$1<strong>$2</strong>')
    .replace(/(^|[\s>])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/(^|[\s>])_([^_\n]+)_/g, '$1<em>$2</em>');

  codeSpans.forEach((code, index) => {
    html = html.replace(`@@CODE${index}@@`, code);
  });
  return html;
}

function sanitizeHref(value: string): string {
  const href = value.trim();
  if (/^(https?:|mailto:|\/|#)/i.test(href)) {
    return href;
  }
  return '';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
