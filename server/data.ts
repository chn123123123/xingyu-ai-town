import type { WorldState } from './types.js';

export const initialWorld = (): WorldState => ({
  name: '星屿镇',
  tick: 1,
  time: '08:00',
  weather: '晴朗微风',
  locations: [
    { id: 'cafe', name: '潮汐咖啡馆', icon: '☕', description: '咖啡与故事一起发酵的地方', position: { x: 18, y: 20 } },
    { id: 'studio', name: '萤火工坊', icon: '🛠️', description: '装满图纸、木屑和奇妙机械', position: { x: 66, y: 17 } },
    { id: 'park', name: '风铃公园', icon: '🌳', description: '风穿过树梢时会响起风铃声', position: { x: 40, y: 62 } },
    { id: 'pier', name: '月光码头', icon: '⛵', description: '适合放空、看潮汐与星星', position: { x: 77, y: 66 } },
  ],
  npcs: [
    {
      id: 'lin', name: '林默', emoji: '🧑🏻‍🔧', role: '机械师',
      personality: '寡言、理性、认真，但会默默帮助别人', locationId: 'studio', mood: '专注', energy: 78,
      aspiration: '造出一只能记住全镇声音的机械鸟',
      currentAction: '正在校准一只会唱歌的机械鸟', color: '#e26d5c', memories: [],
    },
    {
      id: 'xia', name: '夏芽', emoji: '👩🏻‍🍳', role: '咖啡师',
      personality: '热情、好奇、健谈，喜欢收集镇上的新鲜事', locationId: 'cafe', mood: '开心', energy: 86,
      aspiration: '调出一杯能让人想起美好往事的咖啡',
      currentAction: '为第一批客人准备海盐拿铁', color: '#e9a23b', memories: [],
    },
    {
      id: 'qiu', name: '秋寻', emoji: '🧑🏻‍🎨', role: '旅行画家',
      personality: '浪漫、敏感、随性，总能发现微小的美好', locationId: 'pier', mood: '平静', energy: 69,
      aspiration: '完成一本属于星屿镇的四季画册',
      currentAction: '在速写本上记录晨雾', color: '#627e75', memories: [],
    },
  ],
  events: [],
  quests: [
    {
      id: 'town-observer', title: '小镇观察员', icon: '◉', metric: 'turns', progress: 0, target: 3,
      description: '推进 3 个回合，观察居民如何根据状态做出选择。', reward: '解锁「时间的朋友」徽章', completedAt: null,
    },
    {
      id: 'story-witness', title: '故事见证者', icon: '✦', metric: 'encounters', progress: 0, target: 1,
      description: '见证一次居民相遇，让故事被写进小镇手记。', reward: '解锁「星屿传声筒」徽章', completedAt: null,
    },
  ],
  lastTurn: null,
});
