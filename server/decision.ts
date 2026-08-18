import type { Decision, Npc, WorldEvent, WorldState, ActionType } from './types.js';

const allowedActions: ActionType[] = ['move', 'work', 'rest', 'socialize'];

export function mockDecision(npc: Npc, world: WorldState): Decision {
  if (npc.energy <= 35) {
    return { action: 'rest', target: npc.locationId, reason: `${npc.name}感到疲惫，决定先恢复精力` };
  }

  const phase = (world.tick + world.npcs.indexOf(npc)) % 4;
  if (phase === 0) return { action: 'work', target: npc.locationId, reason: `${npc.name}想专注推进手头的事情` };
  if (phase === 1) {
    const routes: Record<string, string[]> = { lin: ['studio', 'cafe', 'pier'], xia: ['cafe', 'park', 'pier'], qiu: ['pier', 'studio', 'park'] };
    const target = (routes[npc.id] ?? world.locations.map((place) => place.id)).find((id) => id !== npc.locationId) ?? npc.locationId;
    return { action: 'move', target, reason: `${npc.name}想换个地方寻找新的灵感` };
  }
  if (phase === 2) return { action: 'socialize', target: npc.locationId, reason: `${npc.name}注意到身边的人，想聊上几句` };
  return { action: 'rest', target: npc.locationId, reason: `${npc.name}决定放慢节奏，观察周围` };
}

export function validateDecision(value: unknown, world: WorldState, npc: Npc): Decision {
  if (!isValidDecision(value, world, npc)) return mockDecision(npc, world);
  const raw = value as Decision;
  const action = raw.action;
  return { action, target: raw.target!, reason: raw.reason.trim().slice(0, 120) };
}

export function isValidDecision(value: unknown, world: WorldState, npc: Npc): value is Decision {
  if (!value || typeof value !== 'object') return false;
  const raw = value as Partial<Decision>;
  if (!allowedActions.includes(raw.action as ActionType)
    || !world.locations.some((place) => place.id === raw.target)
    || typeof raw.reason !== 'string'
    || !raw.reason.trim()) return false;
  if (raw.action === 'move' && raw.target === npc.locationId) return false;
  if (raw.action !== 'move' && raw.target !== npc.locationId) return false;
  return !world.locations.some((place) => place.id !== raw.target && raw.reason!.includes(place.name));
}

export function applyDecision(npc: Npc, decision: Decision, world: WorldState): void {
  const location = world.locations.find((place) => place.id === decision.target)!;
  const descriptions: Record<ActionType, string> = {
    move: `前往${location.name}`,
    work: npc.id === 'lin' ? '专心打磨机械零件' : npc.id === 'xia' ? '调制新的咖啡配方' : '为眼前的风景添上色彩',
    rest: `在${location.name}稍作休息`,
    socialize: `在${location.name}与邻居分享近况`,
  };

  if (decision.action === 'move') npc.locationId = decision.target;
  if (decision.action === 'rest') npc.energy = Math.min(100, npc.energy + 18);
  else npc.energy = Math.max(0, npc.energy - (decision.action === 'work' ? 14 : 7));
  npc.mood = npc.energy < 35 ? '疲惫' : decision.action === 'work' ? '专注' : decision.action === 'socialize' ? '开心' : '平静';
  npc.currentAction = descriptions[decision.action];
  npc.memories.unshift({ tick: world.tick, time: world.time, action: decision.action, description: npc.currentAction, reason: decision.reason });
  npc.memories = npc.memories.slice(0, 10);
}

const encounterLines: Record<string, string[]> = {
  'lin-xia': ['夏芽递来一杯新配方，林默答应用机械鸟为咖啡馆录一段清晨的声音。', '林默修好了咖啡磨豆机，夏芽把第一杯试机拿铁留给了他。'],
  'lin-qiu': ['秋寻为机械鸟画了新翅膀，林默则帮他修好了松动的画架。', '两人研究怎样让机械鸟衔起画笔，在废纸上留下了一串歪歪扭扭的星星。'],
  'qiu-xia': ['夏芽讲起客人的故事，秋寻把其中一个温柔片段画在了杯套上。', '秋寻用咖啡渍画出潮汐，夏芽决定把它贴在今日菜单旁。'],
};

export function createWorldEvents(world: WorldState): WorldEvent[] {
  const created: WorldEvent[] = [];
  for (const location of world.locations) {
    const residents = world.npcs.filter((npc) => npc.locationId === location.id);
    if (residents.length < 2) continue;
    const pair = residents.slice(0, 2).sort((a, b) => a.id.localeCompare(b.id));
    const key = pair.map((npc) => npc.id).join('-');
    const lines = encounterLines[key];
    const description = lines?.[world.tick % lines.length] ?? `${pair[0].name}和${pair[1].name}在这里交换了今天的见闻。`;
    created.push({
      id: `${world.tick}-${location.id}-${key}`,
      tick: world.tick,
      time: world.time,
      type: 'encounter',
      title: `${pair[0].name} × ${pair[1].name} · 偶遇`,
      description,
      locationId: location.id,
      npcIds: pair.map((npc) => npc.id),
    });
  }
  if (!created.length && world.tick % 3 === 0) {
    created.push({
      id: `${world.tick}-town-bell`, tick: world.tick, time: world.time, type: 'town',
      title: '风铃广播', description: '海风穿过公园的铜铃，整个小镇都听见了一段轻快的旋律。',
      locationId: 'park', npcIds: [],
    });
  }
  world.events = [...created, ...world.events].slice(0, 12);
  return created;
}
