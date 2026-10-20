import { describe, expect, it } from 'vitest';
import {
  createInsightLayout,
  insightNodePath,
  type InsightLayoutNode,
} from '../../shared/insight-graph/layout';

const node = (id: string, kind: InsightLayoutNode['kind']): InsightLayoutNode => ({
  id,
  kind,
  title: id,
});
const root = node('article', 'root');

describe('insight graph layout', () => {
  it('keeps a dense article readable without overlapping or clipping any nodes', () => {
    const topics = Array.from({ length: 6 }, (_, index) => node(`topic-${index}`, 'tl'));
    const leaves = topics.flatMap((topic, index) =>
      Array.from({ length: index + 2 }, (_, child) => node(`${topic.id}-detail-${child}`, 'dl'))
    );
    const edges = leaves.map((leaf) => ({ from: leaf.id.split('-detail-')[0]!, to: leaf.id }));
    const layout = createInsightLayout(root, [...topics, ...leaves], edges);
    expect(layout.nodes).toHaveLength(1 + topics.length + leaves.length);
    for (const current of layout.nodes) {
      expect(current.x).toBeGreaterThanOrEqual(0);
      expect(current.y).toBeGreaterThanOrEqual(0);
      expect(current.x + current.width).toBeLessThanOrEqual(layout.width);
      expect(current.y + current.height).toBeLessThanOrEqual(layout.height);
      for (const other of layout.nodes) {
        if (current === other) continue;
        const overlaps =
          current.x < other.x + other.width &&
          current.x + current.width > other.x &&
          current.y < other.y + other.height &&
          current.y + current.height > other.y;
        expect(overlaps, `${current.node.id} overlaps ${other.node.id}`).toBe(false);
      }
    }
  });

  it('shows shared and unconnected details once and ignores dangling edges', () => {
    const layout = createInsightLayout(
      root,
      [
        node('a', 'tl'),
        node('b', 'tl'),
        node('shared', 'dl'),
        node('orphan', 'dl'),
        node('shared', 'dl'),
      ],
      [
        { from: 'a', to: 'shared' },
        { from: 'b', to: 'shared' },
        { from: 'missing', to: 'a' },
      ]
    );
    expect(layout.nodes.map((view) => view.node.id).sort()).toEqual([
      'a',
      'article',
      'b',
      'orphan',
      'shared',
    ]);
    expect(
      layout.groups
        .flatMap((group) => [group.node, ...group.children])
        .map((item) => item.id)
        .sort()
    ).toEqual(['a', 'b', 'orphan', 'shared']);
    expect(layout.links.some((link) => link.from.node.id === 'missing')).toBe(false);
    expect(layout.links.filter((link) => link.to.node.id === 'shared')).toHaveLength(2);
  });

  it('retains legacy inferred detail parents and highlights the selected reading path', () => {
    const layout = createInsightLayout(root, [node('topic', 'tl'), node('dl-1-detail', 'dl')], []);
    expect([...insightNodePath('dl-1-detail', layout.parents)]).toEqual([
      'dl-1-detail',
      'topic',
      'article',
    ]);
    expect(layout.links).toHaveLength(2);
  });

  it('handles a root-only graph and cyclic input without an endless path walk', () => {
    expect(createInsightLayout(root, [], []).nodes).toHaveLength(1);
    expect([
      ...insightNodePath(
        'a',
        new Map([
          ['a', 'b'],
          ['b', 'a'],
        ])
      ),
    ]).toEqual(['a', 'b']);
  });
});
