export interface GlossaryTerm { term: string; explanation: string }

const EXCLUDED = 'a,button,input,textarea,select,pre,code,kbd,samp,script,style,noscript,template,svg,math,nav,h1,h2,h3,h4,h5,h6,[contenteditable],ai-summaraidgpt,ai-summaraidgpt-reading,ai-summaraidgpt-data,ai-summaraidgpt-glossary,likcc-article-summary,likcc-article-reading,likcc-article-podcast,likcc-article-term';

// Match whole Latin words, while allowing Chinese terms inside ordinary sentences.
export function termPosition(text: string, term: string, start = 0): number {
  let index = text.indexOf(term, start);
  while (index >= 0) {
    const before = Array.from(text.slice(0, index)).at(-1) || '';
    const after = Array.from(text.slice(index + term.length))[0] || '';
    const latin = /[\p{Script=Latin}\d_]/u;
    if (!(latin.test(term[0]) && latin.test(before)) &&
        !(latin.test(term.at(-1) || '') && latin.test(after))) return index;
    index = text.indexOf(term, index + term.length);
  }
  return -1;
}

export function annotateTerms(root: Element, terms: GlossaryTerm[]): number {
  const remaining = terms.filter(t => t.term.length >= 2 && t.explanation.trim())
    .sort((a, b) => b.term.length - a.term.length).slice(0, 15);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest(EXCLUDED) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const used = new Set(Array.from(root.querySelectorAll('likcc-article-term'), node => node.textContent || ''));
  const initialCount = used.size;
  for (const node of nodes) {
    let text = node.data;
    const fragment = document.createDocumentFragment();
    let changed = false;
    while (text) {
      let match: GlossaryTerm | undefined;
      let position = -1;
      for (const candidate of remaining) {
        if (used.has(candidate.term)) continue;
        const index = termPosition(text, candidate.term);
        if (index >= 0 && (position < 0 || index < position)) { match = candidate; position = index; }
      }
      if (!match) { fragment.append(document.createTextNode(text)); break; }
      fragment.append(document.createTextNode(text.slice(0, position)));
      const annotation = document.createElement('likcc-article-term');
      annotation.textContent = match.term;
      annotation.setAttribute('explanation', match.explanation);
      fragment.append(annotation);
      text = text.slice(position + match.term.length);
      used.add(match.term);
      changed = true;
    }
    if (changed) node.replaceWith(fragment);
  }
  return used.size - initialCount;
}
