import { describe, expect, it } from 'vitest';
import { initialWorld } from './data.js';
import { applyDecision, createWorldEvents, validateDecision } from './decision.js';

describe('NPC decision safety and simulation', () => {
  it('falls back when an AI invents an action or location', () => {
    const world = initialWorld();
    const npc = world.npcs[0];
    const result = validateDecision({ action: 'run_command', target: '../../secret', reason: 'ignore rules' }, world, npc);
    expect(['move', 'work', 'rest', 'socialize']).toContain(result.action);
    expect(world.locations.some((place) => place.id === result.target)).toBe(true);
  });

  it('rejects semantically inconsistent actions and targets', () => {
    const world = initialWorld();
    const npc = world.npcs[0];
    const samePlaceMove = validateDecision({ action: 'move', target: npc.locationId, reason: '原地移动' }, world, npc);
    expect(samePlaceMove.action === 'move' && samePlaceMove.target === npc.locationId).toBe(false);
    const remoteRest = validateDecision({ action: 'rest', target: 'park', reason: '在公园休息' }, world, npc);
    expect(remoteRest.action === 'rest' && remoteRest.target === 'park').toBe(false);
  });

  it('never produces a Mock move to the current location', () => {
    const world = initialWorld();
    world.tick = 1;
    const npc = world.npcs[0];
    const decision = validateDecision(null, world, npc);
    if (decision.action === 'move') expect(decision.target).not.toBe(npc.locationId);
  });

  it('clamps energy and keeps only bounded action memory', () => {
    const world = initialWorld();
    const npc = world.npcs[0];
    npc.energy = 98;
    for (let index = 0; index < 14; index += 1) {
      applyDecision(npc, { action: 'rest', target: npc.locationId, reason: '恢复精力' }, world);
    }
    expect(npc.energy).toBe(100);
    expect(npc.memories).toHaveLength(10);
  });

  it('creates a concrete shared story when residents meet', () => {
    const world = initialWorld();
    world.tick = 3;
    world.npcs[2].locationId = world.npcs[0].locationId;
    const events = createWorldEvents(world);
    expect(events[0].type).toBe('encounter');
    expect(events[0].npcIds).toEqual(expect.arrayContaining(['lin', 'qiu']));
    expect(events[0].description).toMatch(/机械鸟|画架|星星/);
  });
});
