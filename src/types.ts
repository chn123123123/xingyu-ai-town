export interface Location {
  id: string; name: string; icon: string; description: string;
  position: { x: number; y: number };
}
export interface Memory { tick: number; time: string; action: string; description: string; reason: string }
export interface Npc {
  id: string; name: string; emoji: string; role: string; personality: string; aspiration: string;
  locationId: string; mood: string; energy: number; currentAction: string; color: string; memories: Memory[];
}
export interface WorldEvent {
  id: string; tick: number; time: string; type: 'encounter' | 'town'; title: string;
  description: string; locationId: string; npcIds: string[];
}
export interface Quest {
  id: string; title: string; description: string; icon: string; metric: 'turns' | 'encounters';
  progress: number; target: number; reward: string; completedAt: number | null;
}
export interface TurnDecision {
  npcId: string; npcName: string; action: string; target: string; reason: string;
  fromLocationId: string; toLocationId: string; energyBefore: number; energyAfter: number; source: 'AI' | 'Mock';
}
export interface TurnReport { tick: number; time: string; headline: string; decisions: TurnDecision[]; events: WorldEvent[]; completedQuestIds: string[] }
export interface World {
  name: string; tick: number; time: string; weather: string; aiMode: 'AI' | 'Mock'; persistence: boolean;
  locations: Location[]; npcs: Npc[]; events: WorldEvent[]; quests: Quest[]; lastTurn: TurnReport | null;
}
