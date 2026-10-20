export interface InsightLayoutNode {
  id: string;
  title: string;
  kind: "root" | "tl" | "dl";
}

export interface InsightLayoutEdge {
  from: string;
  to: string;
}

export interface PositionedNode<T extends InsightLayoutNode> {
  node: T;
  x: number;
  y: number;
  width: number;
  height: number;
  level: "root" | "branch" | "leaf";
}

export interface PositionedLink<T extends InsightLayoutNode> {
  from: PositionedNode<T>;
  to: PositionedNode<T>;
  path: string;
}

export interface InsightLayout<T extends InsightLayoutNode> {
  nodes: PositionedNode<T>[];
  links: PositionedLink<T>[];
  groups: { node: T; children: T[] }[];
  parents: Map<string, string>;
  width: number;
  height: number;
}

const NODE_WIDTH = 184;
const NODE_HEIGHT = 48;
const ROW_GAP = 62;
const GROUP_GAP = 28;
const PADDING = 44;

// Allocate one row per leaf before placing its parent. Dense branches cannot overlap their neighbours.
export function createInsightLayout<T extends InsightLayoutNode>(
  root: T,
  nodes: T[],
  edges: InsightLayoutEdge[],
): InsightLayout<T> {
  const unique = new Map<string, T>([[root.id, root]]);
  for (const node of nodes) if (node.id && !unique.has(node.id)) unique.set(node.id, node);
  const branches = [...unique.values()].filter((node) => node.kind === "tl");
  const leaves = [...unique.values()].filter((node) => node.kind === "dl");
  const parents = new Map<string, string>();
  for (const branch of branches) parents.set(branch.id, root.id);
  for (const edge of edges) {
    if (
      unique.get(edge.from)?.kind === "tl" &&
      unique.get(edge.to)?.kind === "dl" &&
      !parents.has(edge.to)
    ) {
      parents.set(edge.to, edge.from);
    }
  }
  for (const leaf of leaves) {
    if (parents.has(leaf.id)) continue;
    const match = leaf.id.match(/^dl-(\d+)-/);
    const inferred = match ? branches[Number(match[1]) - 1] : undefined;
    if (inferred) parents.set(leaf.id, inferred.id);
  }
  const groups = branches.map((node) => ({
    node,
    children: leaves.filter((leaf) => parents.get(leaf.id) === node.id),
  }));
  for (const leaf of leaves) {
    if (!parents.has(leaf.id)) {
      parents.set(leaf.id, root.id);
      groups.push({ node: leaf, children: [] });
    }
  }
  const contentHeight =
    groups.reduce((height, group) => height + Math.max(1, group.children.length) * ROW_GAP, 0) +
    Math.max(0, groups.length - 1) * GROUP_GAP;
  const height = Math.max(360, contentHeight + PADDING * 2);
  const positioned: PositionedNode<T>[] = [
    { node: root, x: 36, y: height / 2 - 46, width: 204, height: 92, level: "root" },
  ];
  let top = (height - contentHeight) / 2;
  for (const group of groups) {
    const groupHeight = Math.max(1, group.children.length) * ROW_GAP;
    positioned.push({
      node: group.node,
      x: 334,
      y: top + (groupHeight - NODE_HEIGHT) / 2,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      level: group.node.kind === "tl" ? "branch" : "leaf",
    });
    group.children.forEach((node, index) =>
      positioned.push({
        node,
        x: 616,
        y: top + index * ROW_GAP + (ROW_GAP - NODE_HEIGHT) / 2,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        level: "leaf",
      }),
    );
    top += groupHeight + GROUP_GAP;
  }
  const byId = new Map(positioned.map((view) => [view.node.id, view]));
  const connected = new Map<string, InsightLayoutEdge>();
  for (const edge of edges) {
    if (edge.from !== edge.to && byId.has(edge.from) && byId.has(edge.to))
      connected.set(`${edge.from}:${edge.to}`, edge);
  }
  for (const [to, from] of parents) connected.set(`${from}:${to}`, { from, to });
  const links = [...connected.values()].map((edge) => {
    const from = byId.get(edge.from)!;
    const to = byId.get(edge.to)!;
    const startX = from.x + from.width;
    const startY = from.y + from.height / 2;
    const endY = to.y + to.height / 2;
    const midX = (startX + to.x) / 2;
    return {
      from,
      to,
      path: `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${to.x} ${endY}`,
    };
  });
  return { nodes: positioned, links, groups, parents, width: 836, height };
}

export function insightNodePath(id: string, parents: Map<string, string>): Set<string> {
  const path = new Set<string>();
  let current: string | undefined = id;
  while (current && !path.has(current)) {
    path.add(current);
    current = parents.get(current);
  }
  return path;
}

export function insightKindLabel(kind: string): string {
  return kind === "root" ? "文章概览" : kind === "tl" ? "主题" : "延伸阅读";
}
