import { css } from 'lit';

export const articleReadingStyles = css`
  :host {
    display: block;
    width: 100%;
    color: var(--likcc-reading-text, #172132);
    --likcc-reading-surface: #fbfaf7;
    --likcc-reading-panel: #ffffff;
    --likcc-reading-soft: #f5f7f8;
    --likcc-reading-line: rgba(23, 33, 50, 0.12);
    --likcc-reading-muted: #637185;
    --likcc-reading-text: #172132;
    --likcc-reading-accent: #2d9b8a;
    --likcc-reading-link: #d8d5cf;
    --likcc-reading-node: rgba(255, 255, 255, 0.92);
    --likcc-reading-node-soft: rgba(255, 255, 255, 0.84);
    --likcc-reading-node-strong: rgba(255, 255, 255, 0.96);
    --likcc-reading-node-border: #eee3d9;
    --likcc-reading-conclusion: #b15f20;
    --likcc-reading-background: #45aa9b;
    --likcc-reading-core: #6b98dd;
    --likcc-reading-argument: #b864ad;
    --likcc-reading-tl: #b45309;
    --likcc-reading-dl: #be3455;
    --likcc-reading-shadow: 0 18px 45px rgba(24, 34, 49, 0.12);
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  }

  .reading-shell {
    box-sizing: border-box;
    width: 100%;
    margin: 1.2rem 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .reading-shell.is-dark {
    --likcc-reading-surface: #111827;
    --likcc-reading-panel: #182132;
    --likcc-reading-soft: #202b3b;
    --likcc-reading-line: rgba(226, 232, 240, 0.16);
    --likcc-reading-muted: #a8b4c6;
    --likcc-reading-text: #edf2f7;
    --likcc-reading-accent: #72d6c8;
    --likcc-reading-link: #495567;
    --likcc-reading-node: rgba(31, 41, 55, 0.94);
    --likcc-reading-node-soft: rgba(24, 34, 49, 0.9);
    --likcc-reading-node-strong: rgba(39, 50, 68, 0.98);
    --likcc-reading-node-border: #374254;
    --likcc-reading-conclusion: #e1a05e;
    --likcc-reading-background: #6fd3c5;
    --likcc-reading-core: #93b8ff;
    --likcc-reading-argument: #d99bdd;
    --likcc-reading-tl: #fbbf24;
    --likcc-reading-dl: #fb7185;
    --likcc-reading-shadow: 0 18px 36px rgba(0, 0, 0, 0.26);
  }

  .reading-collapse {
    display: flex;
    align-items: center;
    gap: 0.42rem;
    width: max-content;
    min-height: 1.6rem;
    margin: 0 0 0.48rem auto;
    padding: 0.08rem 0.12rem;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--likcc-reading-accent);
    font-size: 0.84rem;
    font-weight: 720;
    line-height: 1.2;
  }

  .reading-collapse:hover {
    border-color: transparent;
    background: transparent;
    transform: none;
    color: color-mix(in srgb, var(--likcc-reading-accent) 74%, var(--likcc-reading-text));
  }

  .reading-collapsed {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 0.58rem;
    width: 100%;
    min-height: 2.55rem;
    padding: 0.36rem 0;
    border: 0;
    border-top: 1px solid color-mix(in srgb, var(--likcc-reading-accent) 20%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--likcc-reading-accent) 14%, transparent);
    border-radius: 0;
    background: transparent;
    color: var(--likcc-reading-text);
    box-shadow: none;
    text-align: left;
  }

  .reading-collapsed:hover {
    border-color: color-mix(in srgb, var(--likcc-reading-accent) 30%, transparent);
    background: color-mix(in srgb, var(--likcc-reading-accent) 4%, transparent);
    transform: none;
  }

  .collapsed-title {
    color: var(--likcc-reading-accent);
    font-size: 0.9rem;
    font-weight: 820;
    line-height: 1.2;
    white-space: nowrap;
  }

  .collapsed-summary {
    min-width: 0;
    overflow: hidden;
    color: var(--likcc-reading-muted);
    font-size: 0.84rem;
    font-weight: 620;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .collapse-mark {
    display: inline-grid;
    place-items: center;
    width: 1rem;
    height: 1rem;
    border: 1px solid color-mix(in srgb, var(--likcc-reading-accent) 34%, transparent);
    border-radius: 6px;
    font-size: 0.78rem;
    line-height: 1;
  }

  button {
    box-sizing: border-box;
    border: 1px solid var(--likcc-reading-line);
    border-radius: 8px;
    background: var(--likcc-reading-panel);
    color: var(--likcc-reading-text);
    min-height: 2rem;
    padding: 0.36rem 0.58rem;
    font: inherit;
    font-size: 0.86rem;
    line-height: 1.2;
    letter-spacing: 0;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease,
      transform 0.18s ease, box-shadow 0.18s ease;
  }

  button:hover {
    border-color: color-mix(in srgb, var(--likcc-reading-accent) 45%, var(--likcc-reading-line));
    transform: translateY(-1px);
  }

  button:focus-visible,
  textarea:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--likcc-reading-accent) 64%, transparent);
    outline-offset: 2px;
  }

  button[disabled] {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  .primary-action {
    border-color: transparent;
    background: var(--likcc-reading-accent);
    color: #ffffff;
  }

  .state-box {
    padding: 0.7rem 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--likcc-reading-muted);
    line-height: 1.7;
  }

  .insight-graph {
    overflow: visible;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .graph-canvas {
    position: relative;
    width: 100%;
    min-width: 0;
    aspect-ratio: 16 / 9;
    min-height: 29rem;
    max-height: 42rem;
    overflow: visible;
    padding: 0;
    background: transparent;
  }

  .graph-board {
    position: absolute;
    inset: 0;
  }

  .graph-links {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }

  .graph-links path {
    fill: none;
    stroke: var(--likcc-reading-link);
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.44;
    vector-effect: non-scaling-stroke;
  }

  .graph-link--branch {
    stroke-width: 2.2;
    opacity: 0.34;
  }

  .graph-link--leaf {
    stroke-width: 2.9;
    opacity: 0.76;
  }

  .graph-dot {
    fill: var(--likcc-reading-panel);
    stroke: var(--likcc-reading-link);
    stroke-width: 0.42;
    opacity: 0.82;
    vector-effect: non-scaling-stroke;
  }

  .graph-dot--branch {
    opacity: 0.5;
  }

  .graph-dot--leaf {
    opacity: 0.92;
  }

  .graph-link--conclusion {
    stroke: var(--likcc-reading-conclusion);
  }

  .graph-dot--conclusion {
    stroke: var(--likcc-reading-conclusion);
  }

  .graph-link--background {
    stroke: var(--likcc-reading-background);
  }

  .graph-dot--background {
    stroke: var(--likcc-reading-background);
  }

  .graph-link--core {
    stroke: var(--likcc-reading-core);
  }

  .graph-dot--core {
    stroke: var(--likcc-reading-core);
  }

  .graph-link--argument {
    stroke: var(--likcc-reading-argument);
  }

  .graph-dot--argument {
    stroke: var(--likcc-reading-argument);
  }

  .graph-node {
    position: absolute;
    z-index: 2;
    --node-color: var(--likcc-reading-link);
    --node-tint: color-mix(in srgb, var(--node-color) 7%, var(--likcc-reading-node));
    display: inline-grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    justify-content: center;
    justify-items: center;
    gap: 0.42rem;
    min-height: 2.36rem;
    min-width: 0;
    width: 8.6rem;
    max-width: 8.6rem;
    padding: 0.32rem 0.58rem 0.34rem;
    border: 1px solid color-mix(in srgb, var(--node-color) 30%, var(--likcc-reading-node-border));
    border-radius: 10px;
    background: var(--node-tint);
    color: var(--likcc-reading-text);
    box-shadow: 0 8px 20px rgba(24, 34, 49, 0.06);
    font-size: 0.82rem;
    font-weight: 760;
    line-height: 1.14;
    text-align: center;
    transform: translate(-50%, -50%);
    transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease,
      box-shadow 0.18s ease, color 0.18s ease;
  }

  .graph-node::after {
    display: none;
  }

  .node-title {
    display: block;
    max-width: 100%;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
    text-align: center;
  }

  .node-icon {
    display: inline-grid;
    place-items: center;
    width: 1.48rem;
    height: 1.48rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--node-color) 12%, var(--likcc-reading-panel));
    color: var(--node-color);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--node-color) 8%, transparent);
  }

  .iconify-icon {
    display: inline-block;
    width: 1em;
    height: 1em;
    flex: 0 0 auto;
    background: currentColor;
    mask: var(--rag-icon-source) center / contain no-repeat;
    -webkit-mask: var(--rag-icon-source) center / contain no-repeat;
  }

  .node-icon .iconify-icon,
  .icon-button .iconify-icon,
  .popover-actions .iconify-icon {
    width: 0.9rem;
    height: 0.9rem;
  }

  .graph-node:hover {
    border-color: color-mix(in srgb, var(--node-color) 52%, var(--likcc-reading-node-border));
    background: color-mix(in srgb, var(--node-color) 12%, var(--likcc-reading-node));
    box-shadow: 0 10px 24px rgba(24, 34, 49, 0.1);
    transform: translate(-50%, calc(-50% - 1px));
  }

  .graph-node.is-active {
    border-color: color-mix(in srgb, var(--node-color) 72%, var(--likcc-reading-node-border));
    background: color-mix(in srgb, var(--node-color) 15%, var(--likcc-reading-node));
    box-shadow: 0 10px 24px rgba(24, 34, 49, 0.12);
  }

  .graph-node--root {
    --node-color: #ffffff;
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 0.48rem;
    width: 8.25rem;
    height: 8.25rem;
    min-height: 0;
    min-width: 0;
    padding: 0.62rem;
    border: 1px solid #26323f;
    border-radius: 999px;
    background:
      radial-gradient(circle at 38% 26%, rgba(255, 255, 255, 0.1), transparent 28%),
      linear-gradient(145deg, #1a2432, #0f1722 76%);
    color: #ffffff;
    box-shadow: 0 16px 34px rgba(20, 30, 45, 0.18);
    font-size: 0.78rem;
    font-weight: 760;
    line-height: 1.36;
    text-align: center;
  }

  .graph-node--root > * {
    position: relative;
    z-index: 1;
  }

  .graph-node--root::before {
    content: "";
    position: absolute;
    inset: -0.55rem;
    border: 1px dashed rgba(100, 116, 139, 0.32);
    border-radius: inherit;
    pointer-events: none;
  }

  .graph-node--root .node-icon {
    width: 1.78rem;
    height: 1.78rem;
    background: transparent;
    color: #ffffff;
    box-shadow: none;
  }

  .graph-node--root .node-icon .iconify-icon {
    width: 1.45rem;
    height: 1.45rem;
  }

  .graph-node--root .node-title {
    display: -webkit-box;
    max-width: 6.6rem;
    overflow: hidden;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .graph-node--root:hover,
  .graph-node--root.is-active {
    border-color: #26323f;
    background:
      radial-gradient(circle at 38% 26%, rgba(255, 255, 255, 0.1), transparent 28%),
      linear-gradient(145deg, #1a2432, #0f1722 76%);
    color: #ffffff;
    box-shadow: 0 16px 34px rgba(20, 30, 45, 0.18);
    transform: translate(-50%, -50%);
  }

  .graph-node--root::after {
    display: none;
  }

  .graph-node--branch {
    width: 8.8rem;
    min-width: 8.8rem;
    min-height: 2.58rem;
    max-width: 8.8rem;
    font-size: 0.88rem;
    font-weight: 800;
  }

  .graph-node--leaf {
    min-height: 2.34rem;
    width: 7.55rem;
    min-width: 7.55rem;
    max-width: 7.55rem;
    background: color-mix(in srgb, var(--node-color) 5%, var(--likcc-reading-node-soft));
    box-shadow: 0 8px 18px rgba(24, 34, 49, 0.05);
    font-size: 0.76rem;
    font-weight: 720;
  }

  .graph-node--branch .node-title,
  .graph-node--leaf .node-title {
    display: -webkit-box;
    overflow: hidden;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .graph-node--branch .node-title {
    max-width: 6.6rem;
  }

  .graph-node--leaf .node-title {
    max-width: 5.45rem;
  }

  .graph-node--tone-conclusion {
    --node-color: var(--likcc-reading-conclusion);
  }

  .graph-node--tone-background {
    --node-color: var(--likcc-reading-background);
  }

  .graph-node--tone-core {
    --node-color: var(--likcc-reading-core);
  }

  .graph-node--tone-argument {
    --node-color: var(--likcc-reading-argument);
  }

  .reading-shell.is-dark .insight-graph {
    background: transparent;
  }

  .reading-shell.is-dark .graph-node {
    background: color-mix(in srgb, var(--node-color) 8%, var(--likcc-reading-node));
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
  }

  .reading-shell.is-dark .graph-node--root {
    background: #111827;
    border-color: #566274;
    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.3);
  }

  .reading-shell.is-dark .graph-node--leaf {
    background: color-mix(in srgb, var(--node-color) 8%, var(--likcc-reading-node-soft));
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  }

  .reading-shell.is-dark .node-icon {
    background: color-mix(in srgb, var(--node-color) 18%, var(--likcc-reading-panel));
  }

  .node-popover {
    position: absolute;
    top: 50%;
    right: 1.25rem;
    z-index: 4;
    box-sizing: border-box;
    width: min(20.5rem, 28vw);
    max-height: min(31rem, calc(100% - 3rem));
    overflow: auto;
    padding: 1.22rem;
    border: 1px solid var(--likcc-reading-line);
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.9));
    color: var(--likcc-reading-text);
    box-shadow: 0 22px 50px rgba(24, 34, 49, 0.14);
    transform: translateY(-50%);
    animation: reading-popover-in 0.2s ease both;
  }

  .reading-shell.is-dark .node-popover {
    border-color: var(--likcc-reading-line);
    background: linear-gradient(180deg, rgba(24, 33, 50, 0.98), rgba(18, 25, 38, 0.94));
    box-shadow: 0 20px 46px rgba(0, 0, 0, 0.38);
  }

  .popover-head,
  .question-actions,
  .popover-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.42rem;
  }

  .popover-head {
    justify-content: flex-end;
    margin-bottom: 0.72rem;
  }

  .icon-button {
    display: inline-grid;
    place-items: center;
    width: 2rem;
    min-height: 2rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--likcc-reading-text);
  }

  .node-popover h3 {
    margin: 0;
    color: var(--likcc-reading-text);
    font-size: 1.1rem;
    font-weight: 850;
    line-height: 1.38;
    letter-spacing: 0;
    overflow-wrap: anywhere;
  }

  .node-popover p {
    margin: 0.72rem 0 0;
    color: var(--likcc-reading-muted);
    font-size: 0.92rem;
    line-height: 1.82;
    overflow-wrap: anywhere;
  }

  .source-anchor {
    width: 100%;
    min-height: 2.8rem;
    margin-top: 1rem;
    border: 1px solid color-mix(in srgb, var(--likcc-reading-accent) 26%, var(--likcc-reading-line));
    border-radius: 9px;
    background: color-mix(in srgb, var(--likcc-reading-accent) 7%, var(--likcc-reading-panel));
    color: var(--likcc-reading-text);
    text-align: left;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .reading-shell.is-dark .source-anchor {
    background: color-mix(in srgb, var(--likcc-reading-accent) 10%, var(--likcc-reading-panel));
  }

  .payload-list {
    display: grid;
    gap: 0.42rem;
    margin: 1rem 0 0;
    padding: 0;
    list-style: none;
  }

  .payload-list li {
    position: relative;
    padding-left: 0.92rem;
    color: var(--likcc-reading-text);
    font-size: 0.88rem;
    line-height: 1.58;
    overflow-wrap: anywhere;
  }

  .payload-list li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.64em;
    width: 0.34rem;
    height: 0.34rem;
    border-radius: 999px;
    background: color-mix(in srgb, var(--likcc-reading-accent) 76%, var(--likcc-reading-muted));
  }

  .popover-actions {
    margin-top: 1.05rem;
    padding-top: 0.8rem;
    border-top: 1px solid var(--likcc-reading-line);
  }

  .popover-actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.48rem;
    min-height: 2rem;
    padding: 0.34rem 0.2rem;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--likcc-reading-text);
    font-size: 0.84rem;
    font-weight: 700;
  }

  .question-composer {
    margin-top: 0.72rem;
    padding-top: 0.72rem;
    border-top: 1px solid var(--likcc-reading-line);
  }

  .question-input {
    box-sizing: border-box;
    width: 100%;
    min-height: 5.2rem;
    resize: vertical;
    border: 1px solid var(--likcc-reading-line);
    border-radius: 8px;
    background: var(--likcc-reading-panel);
    color: var(--likcc-reading-text);
    padding: 0.62rem;
    font: inherit;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .reading-shell.is-dark .question-input {
    background: var(--likcc-reading-soft);
  }

  .question-actions {
    margin-top: 0.5rem;
  }

  .answer-box {
    margin-top: 0.62rem;
    padding: 0.64rem 0.7rem;
    border-left: 3px solid var(--likcc-reading-accent);
    background: color-mix(in srgb, var(--likcc-reading-accent) 8%, transparent);
    color: var(--likcc-reading-text);
    font-size: 0.9rem;
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  @media (max-width: 760px) {
    .reading-shell {
      padding: 0;
    }

    .graph-canvas {
      aspect-ratio: 9 / 14;
      min-height: clamp(34rem, 138vw, 44rem);
    }

    .graph-node {
      width: 5.75rem;
      min-width: 5.75rem;
      max-width: 5.75rem;
      min-height: 2.08rem;
      padding: 0.26rem 0.38rem;
      gap: 0.28rem;
      font-size: 0.68rem;
      line-height: 1.12;
    }

    .node-icon {
      width: 1.16rem;
      height: 1.16rem;
    }

    .node-icon .iconify-icon,
    .icon-button .iconify-icon,
    .popover-actions .iconify-icon {
      width: 0.74rem;
      height: 0.74rem;
    }

    .node-title {
      display: -webkit-box;
      max-width: 3.9rem;
      overflow: hidden;
      white-space: normal;
      word-break: break-word;
      overflow-wrap: anywhere;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .graph-node--root {
      width: 5.7rem;
      height: 5.7rem;
      padding: 0.5rem;
      font-size: 0.62rem;
    }

    .graph-node--root::before {
      inset: -0.38rem;
    }

    .graph-node--root .node-icon {
      width: 1.36rem;
      height: 1.36rem;
    }

    .graph-node--root .node-icon .iconify-icon {
      width: 1.08rem;
      height: 1.08rem;
    }

    .graph-node--root .node-title {
      max-width: 4.6rem;
      -webkit-line-clamp: 3;
    }

    .graph-node--branch {
      width: 5.9rem;
      min-width: 5.9rem;
      max-width: 5.9rem;
      font-size: 0.72rem;
    }

    .graph-node--leaf {
      width: 5.45rem;
      min-width: 5.45rem;
      max-width: 5.45rem;
      font-size: 0.66rem;
    }

    .node-popover {
      position: fixed;
      inset: auto 1rem 1rem 1rem;
      width: auto;
      max-height: 24rem;
      transform: none;
      animation: reading-popover-mobile-in 0.2s ease both;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }

    button:hover {
      transform: none;
    }

    .node-popover {
      animation: none;
    }
  }

  @keyframes reading-popover-in {
    from {
      opacity: 0;
      transform: translateY(-50%) translateX(14px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(-50%) translateX(0) scale(1);
    }
  }

  @keyframes reading-popover-mobile-in {
    from {
      opacity: 0;
      transform: translateY(14px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;
