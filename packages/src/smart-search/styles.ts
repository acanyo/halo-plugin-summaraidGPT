import { css } from 'lit';

// Keep the official modal and input untouched; theme only our supplemental controls and panel.
export const searchStyles = css`
  :host {
    --text:var(--halo-search-widget-content-color,CanvasText);
    --muted:var(--halo-search-widget-muted-color,#6b7280);
    --secondary:color-mix(in srgb,var(--text) 55%,var(--muted));
    --primary:var(--halo-search-widget-primary-color,#4f7ff7);
    --divider:var(--halo-search-widget-divider-color,var(--halo-search-widget-color-form-divider,#e5e7eb));
    --surface:var(--halo-search-widget-base-bg-color,var(--halo-search-widget-modal-bg-color,#fff));
    --tint:color-mix(in srgb,var(--primary) 7%,var(--surface));
    --outline:color-mix(in srgb,var(--primary) 22%,var(--divider));
    --soft:color-mix(in srgb,var(--text) 3%,var(--surface));
    display:block; color:var(--text); font:inherit;
  }
  * { box-sizing:border-box; }
  svg { display:block; width:16px; height:16px; flex:none; }
  button,a { -webkit-tap-highlight-color:transparent; }
  button { appearance:none; font:inherit; cursor:pointer; }
  button:disabled { cursor:default; }
  button:focus-visible,a:focus-visible { outline:2px solid var(--primary); outline-offset:3px; }
  .toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 16px; }
  .actions { display:inline-flex; align-items:center; gap:4px; padding:3px;
    border:1px solid var(--divider); border-radius:9px; background:var(--soft); }
  .action { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:28px;
    border:1px solid transparent; border-radius:6px; padding:3px 10px;
    font-size:12px; line-height:20px; font-weight:500; color:var(--secondary); background:transparent; }
  .action svg { width:15px; height:15px; }
  .action:hover:not(:disabled),.action[aria-expanded=true] { color:var(--primary); border-color:var(--outline); background:var(--surface); }
  .action.ai { color:var(--primary); background:var(--surface); border-color:var(--outline); }
  .action.ai:hover:not(:disabled),.action.ai[aria-expanded=true] { background:var(--tint); border-color:var(--primary); }
  .action:disabled { color:var(--secondary); }
  .action:disabled svg { color:var(--secondary); opacity:.75; }
  .action-hint { color:var(--secondary); font-size:11px; line-height:18px; white-space:nowrap; }
  .panel { margin:0 16px 16px; border:1px solid var(--outline); border-radius:10px; overflow:hidden;
    background:var(--surface); box-shadow:0 2px 8px color-mix(in srgb,var(--text) 3%,transparent); }
  .heading { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:12px 14px 10px; background:var(--tint); }
  .panel-title { display:flex; align-items:center; gap:8px; min-width:0; font-size:13px; line-height:20px; font-weight:600; }
  .panel-icon { display:flex; align-items:center; justify-content:center; width:26px; height:26px;
    border-radius:6px; background:var(--tint); color:var(--primary); }
  .panel-controls { display:flex; align-items:center; gap:8px; flex:none; }
  .text-action { display:inline-flex; align-items:center; justify-content:center; gap:3px; border:0;
    border-radius:4px; padding:3px 4px; min-height:28px; color:var(--secondary); background:transparent;
    font-size:12px; line-height:20px; white-space:nowrap; }
  .text-action:hover { color:var(--primary); background:var(--tint); }
  .text-action svg { width:14px; height:14px; }
  .panel-body { padding:10px 14px 14px; }
  .notice { color:var(--secondary); font-size:12px; line-height:1.7; margin:4px 0; }
  .progress { display:flex; align-items:center; gap:8px; }
  .spinner { width:12px; height:12px; border:1.5px solid var(--outline); border-top-color:var(--primary); border-radius:50%; flex:none; }
  .error { color:var(--text); }
  a { color:var(--primary); overflow-wrap:anywhere; }
  .results { list-style:none; padding:0; margin:0 -4px; }
  .result { display:flex; align-items:flex-start; gap:9px; padding:10px 4px; border-radius:5px;
    text-decoration:none; color:var(--text); }
  .result:hover { background:var(--tint); }
  .result-icon { color:var(--secondary); margin-top:3px; }
  .result>div { min-width:0; flex:1; }
  .result-arrow { color:var(--secondary); margin-top:3px; }
  .result strong { font-size:14px; line-height:22px; font-weight:500; }
  .result p { margin:4px 0 0; color:var(--secondary); font-size:12px; line-height:1.7;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .prose { font-size:14px; line-height:1.8; overflow-wrap:anywhere; }
  .prose p { margin:0 0 10px; } .prose p:last-child { margin-bottom:0; }
  .prose img { max-width:100%; }
  .prose pre { overflow:auto; background:var(--tint); border-radius:5px; padding:10px; }
  .prose h1,.prose h2,.prose h3 { font-size:14px; font-weight:600; margin:10px 0 6px; }
  .prose ul,.prose ol { padding-left:20px; margin:8px 0; }
  .prose table { display:block; overflow:auto; border-collapse:collapse; }
  .prose th,.prose td { border:1px solid var(--divider); padding:4px 8px; }
  .sources { border-top:1px solid var(--divider); padding:10px 14px 12px; background:var(--surface); }
  .source-label { color:var(--secondary); font-size:11px; line-height:18px; }
  .source-links { display:flex; flex-wrap:wrap; gap:6px; margin-top:5px; }
  .source-links a { display:inline-flex; align-items:center; gap:5px; max-width:100%; min-height:28px;
    border:1px solid var(--divider); padding:4px 7px; border-radius:5px; color:var(--text);
    background:var(--surface); font-size:12px; line-height:18px; text-decoration:none; }
  .source-links a:hover { border-color:var(--outline); color:var(--primary); background:var(--tint); }
  .source-links svg { width:13px; height:13px; color:var(--secondary); }
  .source-links a span { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  @media(max-width:380px) {
    .toolbar { padding-inline:12px; gap:8px; }
    .action-hint { display:none; }
    .panel { margin-inline:12px; }
    .heading { padding-inline:10px; } .panel-body { padding-inline:12px; }
    .panel-controls { gap:3px; } .panel-title { gap:6px; }
    .text-action { gap:1px; padding-inline:2px; }
  }
  @media(prefers-reduced-motion:no-preference) {
    .spinner { animation:spin .8s linear infinite; }
    .action,.text-action,.source-links a { transition:background-color .15s,border-color .15s,color .15s; }
    @keyframes spin { to { transform:rotate(360deg); } }
  }
`;
