// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { AgentToolRuntime } from '../src/rag-assistant/agent/runtime';

afterEach(() => { document.body.innerHTML = ''; });
describe('tool approval queue', () => {
  it('shows concurrent tool confirmations in order without orphaning a decision', async () => {
    const runtime = new AgentToolRuntime();
    const first = runtime.requestApproval('第一项文档查询');
    const second = runtime.requestApproval('第二项文档查询');
    await Promise.resolve();
    expect(document.body.textContent).toContain('第一项文档查询');
    expect(document.body.textContent).not.toContain('第二项文档查询');
    (document.querySelector('button') as HTMLButtonElement).click();
    expect(await first).toBe(true);
    await Promise.resolve();
    expect(document.body.textContent).toContain('第二项文档查询');
    (document.querySelectorAll('button')[1] as HTMLButtonElement).click();
    expect(await second).toBe(false);
    expect(document.getElementById('summaraid-agent-approval')).toBeNull();
  });
  it('stops the active approval and queued approvals without showing the next prompt', async () => {
    const runtime = new AgentToolRuntime();
    const first = runtime.requestApproval('当前查询');
    const second = runtime.requestApproval('排队查询');
    await Promise.resolve();
    runtime.cancelPendingApprovals();
    expect(await first).toBe(false);
    expect(await second).toBe(false);
    expect(document.getElementById('summaraid-agent-approval')).toBeNull();
  });
});
