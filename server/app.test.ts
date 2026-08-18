import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, world } from './app.js';
import { initialWorld } from './data.js';

beforeEach(() => Object.assign(world, initialWorld()));

describe('AI Town API', () => {
  it('advances a turn and records validated NPC actions in Mock mode', async () => {
    const response = await request(app).post('/api/world/tick').expect(200);
    expect(response.body.tick).toBe(2);
    expect(response.body.lastTurn.decisions).toHaveLength(3);
    expect(response.body.npcs.every((npc: { memories: unknown[] }) => npc.memories.length === 1)).toBe(true);
    expect(['move', 'work', 'rest', 'socialize']).toContain(response.body.lastTurn.decisions[0].action);
    expect(response.body.lastTurn.decisions[0].source).toBe('Mock');
  });

  it('validates chat input and returns a character-specific reply', async () => {
    await request(app).post('/api/npcs/lin/chat').send({ message: '   ' }).expect(400);
    const response = await request(app).post('/api/npcs/xia/chat').send({ message: '今天推荐什么？' }).expect(200);
    expect(response.body.mode).toBe('Mock');
    expect(response.body.reply).toMatch(/咖啡|拿铁|磨豆|甜味/);
  });

  it('returns a clear 404 for an unknown NPC', async () => {
    const response = await request(app).get('/api/npcs/nobody').expect(404);
    expect(response.body.error).toBe('NPC_NOT_FOUND');
  });

  it('rejects malformed JSON without exposing an internal error', async () => {
    const response = await request(app).post('/api/npcs/lin/chat').set('Content-Type', 'application/json').send('{bad json').expect(400);
    expect(response.body.error).toBe('INVALID_JSON');
  });

  it('resets the world for a repeatable live demo', async () => {
    await request(app).post('/api/world/tick').expect(200);
    const response = await request(app).post('/api/world/reset').expect(200);
    expect(response.body.tick).toBe(1);
    expect(response.body.events).toEqual([]);
    expect(response.body.lastTurn).toBeNull();
  });
});
