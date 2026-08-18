import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import path from 'node:path';
import { initialWorld } from './data.js';
import { aiMode, decideForNpc, replyAsNpc } from './ai.js';
import { applyDecision, createWorldEvents } from './decision.js';
import { loadWorld, persistenceEnabled, saveWorld } from './store.js';
import { updateQuests } from './quest.js';
import type { WorldState } from './types.js';

export const world: WorldState = await loadWorld(initialWorld());
export const app = express();
app.use(cors());
app.use(express.json({ limit: '10kb' }));

const worldView = () => ({ ...world, aiMode: aiMode(), persistence: persistenceEnabled() });
let tickInProgress = false;

app.get('/api/health', (_req, res) => res.json({ ok: true, mode: aiMode(), persistence: persistenceEnabled(), version: '1.1.0' }));
app.get('/api/world', (_req, res) => res.json(worldView()));

app.post('/api/world/tick', async (_req, res, next) => {
  if (tickInProgress) return res.status(409).json({ error: 'TICK_IN_PROGRESS', message: '居民们还在思考上一回合' });
  tickInProgress = true;
  try {
    world.tick += 1;
    world.time = `${String((8 + (world.tick - 1) * 2) % 24).padStart(2, '0')}:00`;
    const before = new Map(world.npcs.map((npc) => [npc.id, { locationId: npc.locationId, energy: npc.energy }]));
    const decisions = await Promise.all(world.npcs.map((npc) => decideForNpc(npc, world)));
    world.npcs.forEach((npc, index) => applyDecision(npc, decisions[index], world));
    const events = createWorldEvents(world);
    const completedQuestIds = updateQuests(world, events);
    const turnDecisions = decisions.map((decision, index) => {
      const npc = world.npcs[index];
      const previous = before.get(npc.id)!;
      return { npcId: npc.id, npcName: npc.name, fromLocationId: previous.locationId, toLocationId: npc.locationId, energyBefore: previous.energy, energyAfter: npc.energy, ...decision };
    });
    world.lastTurn = {
      tick: world.tick, time: world.time,
      headline: events.some((event) => event.type === 'encounter') ? '一次意想不到的相遇，让小镇有了新的故事' : '每位居民都顺着自己的节奏，做出了选择',
      decisions: turnDecisions, events, completedQuestIds,
    };
    await saveWorld(world);
    res.json(worldView());
  } catch (error) { next(error); }
  finally { tickInProgress = false; }
});

app.post('/api/world/reset', async (_req, res, next) => {
  try {
    Object.assign(world, initialWorld());
    await saveWorld(world);
    res.json(worldView());
  } catch (error) { next(error); }
});

app.get('/api/npcs/:id', (req, res) => {
  const npc = world.npcs.find((item) => item.id === req.params.id);
  if (!npc) return res.status(404).json({ error: 'NPC_NOT_FOUND', message: '没有找到这位居民' });
  res.json({ ...npc, memories: npc.memories.slice(0, 3) });
});

app.post('/api/npcs/:id/chat', async (req, res, next) => {
  try {
    const npc = world.npcs.find((item) => item.id === req.params.id);
    if (!npc) return res.status(404).json({ error: 'NPC_NOT_FOUND', message: '没有找到这位居民' });
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!message) return res.status(400).json({ error: 'INVALID_MESSAGE', message: '请输入想说的话' });
    if (message.length > 200) return res.status(400).json({ error: 'MESSAGE_TOO_LONG', message: '消息不能超过 200 个字' });
    res.json(await replyAsNpc(npc, message));
  } catch (error) { next(error); }
});

const clientDir = path.resolve(process.cwd(), 'dist');
app.use(express.static(clientDir));
app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDir, 'index.html')));
app.use((_req, res) => res.status(404).json({ error: 'NOT_FOUND', message: '接口不存在' }));
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'INVALID_JSON', message: '请求内容不是有效的 JSON' });
  }
  console.error(error);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: '小镇暂时开小差了，请稍后重试' });
};
app.use(errorHandler);
