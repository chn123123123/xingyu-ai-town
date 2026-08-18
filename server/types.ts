export type ActionType = 'move' | 'work' | 'rest' | 'socialize';
export type Mood = '平静' | '专注' | '开心' | '疲惫';

export interface Location {
  id: string;
  name: string;
  icon: string;
  description: string;
  position: { x: number; y: number };
}

export interface ActionRecord {
  tick: number;
  time: string;
  action: ActionType;
  description: string;
  reason: string;
}

export interface Npc {
  id: string;
  name: string;
  emoji: string;
  role: string;
  personality: string;
  aspiration: string;
  locationId: string;
  mood: Mood;
  energy: number;
  currentAction: string;
  color: string;
  memories: ActionRecord[];
}

export interface WorldEvent {
  id: string;
  tick: number;
  time: string;
  type: 'encounter' | 'town';
  title: string;
  description: string;
  locationId: string;
  npcIds: string[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  metric: 'turns' | 'encounters';
  progress: number;
  target: number;
  reward: string;
  completedAt: number | null;
}

export interface TurnDecision extends Decision {
  npcId: string;
  npcName: string;
  fromLocationId: string;
  toLocationId: string;
  energyBefore: number;
  energyAfter: number;
  source: 'AI' | 'Mock';
}

export interface TurnReport {
  tick: number;
  time: string;
  headline: string;
  decisions: TurnDecision[];
  events: WorldEvent[];
  completedQuestIds: string[];
}

export interface WorldState {
  name: string;
  tick: number;
  time: string;
  weather: string;
  locations: Location[];
  npcs: Npc[];
  events: WorldEvent[];
  quests: Quest[];
  lastTurn: TurnReport | null;
}

export interface Decision {
  action: ActionType;
  target: string;
  reason: string;
}
