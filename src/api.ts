import type { Npc, World } from './types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message ?? '连接小镇失败，请稍后再试');
  return body as T;
}

export const api = {
  getWorld: () => request<World>('/api/world'),
  tick: () => request<World>('/api/world/tick', { method: 'POST' }),
  reset: () => request<World>('/api/world/reset', { method: 'POST' }),
  getNpc: (id: string) => request<Npc>(`/api/npcs/${id}`),
  chat: (id: string, message: string) => request<{ reply: string; mode: 'AI' | 'Mock' }>(`/api/npcs/${id}/chat`, { method: 'POST', body: JSON.stringify({ message }) }),
};
