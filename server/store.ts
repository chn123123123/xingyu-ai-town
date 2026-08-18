import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { WorldState } from './types.js';

const dataDir = path.resolve(process.cwd(), '.data');
const dataFile = path.join(dataDir, 'world.json');
const tempFile = path.join(dataDir, 'world.tmp.json');

export const persistenceEnabled = () => process.env.PERSIST_WORLD === 'true';

export async function loadWorld(fallback: WorldState): Promise<WorldState> {
  if (!persistenceEnabled()) return fallback;
  try {
    const parsed = JSON.parse(await readFile(dataFile, 'utf8')) as WorldState;
    if (!parsed || !Array.isArray(parsed.locations) || !Array.isArray(parsed.npcs) || typeof parsed.tick !== 'number') return fallback;
    return {
      ...fallback,
      ...parsed,
      locations: fallback.locations.map((place) => ({ ...place, ...parsed.locations.find((item) => item.id === place.id) })),
      npcs: fallback.npcs.map((npc) => ({ ...npc, ...parsed.npcs.find((item) => item.id === npc.id) })),
      events: parsed.events ?? [],
      quests: fallback.quests.map((quest) => ({ ...quest, ...parsed.quests?.find((item) => item.id === quest.id) })),
      lastTurn: parsed.lastTurn ?? null,
    };
  } catch { return fallback; }
}

export async function saveWorld(world: WorldState): Promise<void> {
  if (!persistenceEnabled()) return;
  await mkdir(dataDir, { recursive: true });
  await writeFile(tempFile, JSON.stringify(world, null, 2), 'utf8');
  await rename(tempFile, dataFile);
}
