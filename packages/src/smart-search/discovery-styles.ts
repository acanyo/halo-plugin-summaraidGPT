import { css } from 'lit';

export const discoveryStyles = css`
  :host { display:block; container-type:inline-size; color:var(--text); font:inherit; }
  * { box-sizing:border-box; }
  svg { display:block; width:15px; height:15px; flex:none; }
  .discovery { padding:0 16px 8px; }
  section+section { margin-top:14px; }
  header { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:7px; min-height:28px; }
  h3 { display:flex; align-items:center; gap:7px; margin:0; font-size:13px; font-weight:600; line-height:20px; }
  .section-icon { display:flex; align-items:center; justify-content:center; width:25px; height:25px;
    border:1px solid var(--outline); border-radius:7px; color:var(--primary); background:var(--tint); }
  .popular .section-icon { border-color:color-mix(in srgb,#e87932 20%,var(--divider));
    color:#d8752a; background:color-mix(in srgb,#e87932 7%,var(--surface)); }
  .caption { color:var(--secondary); font-size:11px; line-height:18px; }
  button { display:inline-flex; align-items:center; gap:4px; font:inherit; font-size:12px;
    line-height:20px; padding:3px 7px; min-height:28px; background:transparent; border:1px solid var(--divider);
    border-radius:6px; color:var(--secondary); cursor:pointer; }
  button svg { width:13px; height:13px; }
  button:hover { color:var(--primary); background:var(--tint); border-color:var(--outline); }
  button:disabled { cursor:default; opacity:.6; }
  button:focus-visible,a:focus-visible { outline:2px solid var(--primary); outline-offset:2px; }
  ul,ol { list-style:none; padding:0; margin:0; }
  a { display:flex; align-items:center; gap:10px; min-height:38px; padding:8px;
    border-radius:7px; text-decoration:none; color:var(--text); }
  a:hover { background:var(--tint); color:var(--primary); }
  .title { flex:1; min-width:0; font-size:14px; line-height:22px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .article-icon,.arrow { display:flex; color:var(--secondary); flex:none; }
  .arrow svg { width:13px; height:13px; }
  .random-list { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
  .random-list a { display:grid; grid-template-columns:1fr auto; grid-template-rows:16px 40px;
    align-items:start; gap:7px 6px; height:100%; min-height:84px; padding:10px;
    border:1px solid var(--divider); border-radius:9px; background:var(--soft); }
  .random-list a:hover { background:var(--tint); border-color:var(--outline); }
  .random-list .article-icon { color:var(--primary); }
  .random-list .article-icon svg { width:16px; height:16px; }
  .random-list .arrow { grid-column:2; grid-row:1; margin-top:2px; }
  .random-list .title { grid-column:1/-1; grid-row:2; font-size:13px; line-height:20px;
    font-weight:500; white-space:normal; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
  .popular-list li+li { border-top:1px solid color-mix(in srgb,var(--divider) 55%,transparent); }
  .rank { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px;
    flex:none; font-size:13px; font-weight:600; font-variant-numeric:tabular-nums;
    color:var(--secondary); }
  .popular-list li:first-child .rank { color:#d8752a; }
  .popular-list li:first-child .title { font-weight:500; }
  .visits { display:inline-flex; align-items:center; gap:4px; flex:none; color:var(--secondary);
    font-size:11px; line-height:20px; font-variant-numeric:tabular-nums; white-space:nowrap; }
  .visits svg { width:13px; height:13px; }
  .message { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:3px 0 0;
    font-size:12px; line-height:22px; color:var(--secondary); }
  .skeleton { height:12px; margin:14px 8px; width:65%; border-radius:3px;
    background:color-mix(in srgb,var(--text) 7%,var(--surface)); }
  .skeleton:nth-child(2) { width:82%; }
  .random-placeholder { height:85px; border-radius:9px; border:1px solid var(--divider); background:var(--soft); }
  .random-placeholder .skeleton { margin:14px 11px; width:70%; }
  .random-placeholder .skeleton:first-child { width:18px; height:18px; }
  @container(max-width:440px) {
    .random-list { grid-template-columns:1fr; gap:4px; }
    .random-list a { display:flex; align-items:center; min-height:38px; padding:7px 10px; gap:9px; }
    .random-list .title { display:block; white-space:nowrap; flex:1; font-size:13px; line-height:22px; }
    .random-list .article-icon svg { width:16px; height:16px; }
    .random-list .arrow { order:1; margin:0; }
    .random-placeholder { height:38px; }
    .random-placeholder .skeleton { margin:14px 11px; width:65%; }
    .random-placeholder .skeleton:first-child { display:none; }
    .caption { font-size:10px; }
  }
  @container(max-width:380px) {
    .discovery { padding-inline:12px; }
    a { gap:7px; padding-inline:4px; }
    .popular-list .title { font-size:13px; }
    .visits { font-size:10px; gap:3px; }
  }
  @media(prefers-reduced-motion:no-preference) {
    a,button { transition:background-color .15s,border-color .15s,color .15s; }
    button:disabled svg { animation:spin 1s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  }
`;
