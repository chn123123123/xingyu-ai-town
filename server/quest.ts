import type { Quest, WorldEvent, WorldState } from './types.js';

export function updateQuests(world: WorldState, newEvents: WorldEvent[]): string[] {
  const newlyCompleted: string[] = [];
  for (const quest of world.quests) {
    if (quest.completedAt !== null) continue;
    if (quest.metric === 'turns') quest.progress = Math.min(quest.target, quest.progress + 1);
    if (quest.metric === 'encounters') {
      quest.progress = Math.min(quest.target, quest.progress + newEvents.filter((event) => event.type === 'encounter').length);
    }
    if (quest.progress >= quest.target) {
      quest.completedAt = world.tick;
      newlyCompleted.push(quest.id);
    }
  }
  return newlyCompleted;
}

export function questProgress(quest: Quest): number {
  return Math.round((quest.progress / quest.target) * 100);
}
