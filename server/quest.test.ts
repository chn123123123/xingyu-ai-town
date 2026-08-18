import { describe, expect, it } from 'vitest';
import { initialWorld } from './data.js';
import { updateQuests } from './quest.js';
import type { WorldEvent } from './types.js';

describe('town quests', () => {
  it('completes the observer quest after three turns only once', () => {
    const world = initialWorld();
    expect(updateQuests(world, [])).toEqual([]);
    expect(updateQuests(world, [])).toEqual([]);
    expect(updateQuests(world, [])).toEqual(['town-observer']);
    expect(updateQuests(world, [])).toEqual([]);
    expect(world.quests[0].progress).toBe(3);
  });

  it('completes the story quest after an encounter event', () => {
    const world = initialWorld();
    world.tick = 3;
    const event: WorldEvent = { id: 'test', tick: 3, time: '12:00', type: 'encounter', title: '偶遇', description: '故事', locationId: 'park', npcIds: ['lin', 'qiu'] };
    expect(updateQuests(world, [event])).toContain('story-witness');
    expect(world.quests[1].completedAt).toBe(3);
  });
});
