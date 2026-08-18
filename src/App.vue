<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { api } from './api';
import TownMap from './components/TownMap.vue';
import NpcPanel from './components/NpcPanel.vue';
import TownJournal from './components/TownJournal.vue';
import TownQuests from './components/TownQuests.vue';
import TurnReport from './components/TurnReport.vue';
import CanvasTown from './components/CanvasTown.vue';
import type { Npc, TurnReport as TurnReportType, World } from './types';

const world = ref<World>();
const selected = ref<Npc>();
const loading = ref(true);
const ticking = ref(false);
const error = ref('');
const toast = ref('');
const report = ref<TurnReportType>();
const activeIds = ref<string[]>([]);
const showReset = ref(false);
const mapMode = ref<'classic' | 'canvas'>('classic');
const timeLabel = computed(() => {
  if (!world.value) return '';
  const hour = Number(world.value.time.split(':')[0]);
  return hour < 12 ? '清晨' : hour < 18 ? '午后' : '夜晚';
});

async function load() {
  loading.value = true; error.value = '';
  try { world.value = await api.getWorld(); }
  catch (reason) { error.value = reason instanceof Error ? reason.message : '无法进入小镇'; }
  finally { loading.value = false; }
}

async function nextTurn() {
  if (ticking.value) return;
  ticking.value = true; error.value = '';
  try {
    world.value = await api.tick();
    report.value = world.value.lastTurn ?? undefined;
    activeIds.value = world.value.npcs.map((npc) => npc.id);
    setTimeout(() => activeIds.value = [], 1200);
    if (selected.value) selected.value = world.value.npcs.find((npc) => npc.id === selected.value?.id);
    toast.value = `第 ${world.value.tick} 回合 · 居民们开始了新的行动`;
    setTimeout(() => toast.value = '', 2800);
  } catch (reason) { error.value = reason instanceof Error ? reason.message : '推进失败'; }
  finally { ticking.value = false; }
}

async function resetWorld() {
  ticking.value = true; error.value = '';
  try {
    world.value = await api.reset(); selected.value = undefined; report.value = undefined; showReset.value = false;
    toast.value = '新的一天开始了 · 世界状态已重置';
    setTimeout(() => toast.value = '', 2800);
  } catch (reason) { error.value = reason instanceof Error ? reason.message : '重置失败'; }
  finally { ticking.value = false; }
}

onMounted(load);
</script>

<template>
  <main>
    <header class="topbar">
      <div class="brand"><span class="brand-mark">✦</span><div><strong>星屿镇</strong><small>STARLIGHT TOWN</small></div></div>
      <div v-if="world" class="status-strip">
        <span>第 {{ world.tick }} 回合</span><i></i><span>{{ timeLabel }} {{ world.time }}</span><i></i><span>☀ {{ world.weather }}</span>
        <span class="mode-badge" :class="world.aiMode.toLowerCase()">{{ world.aiMode }} MODE</span>
        <span v-if="world.persistence" class="save-badge">● 已保存</span>
      </div>
      <div class="header-actions"><button class="reset-button" aria-label="重置小镇" @click="showReset = true">↺</button><button class="tick-button" :disabled="ticking" @click="nextTurn"><span>{{ ticking ? '···' : '↻' }}</span>{{ ticking ? '居民思考中' : '推进一回合' }}</button></div>
    </header>

    <section v-if="loading" class="center-state"><div class="loader"></div><p>正在唤醒小镇居民…</p></section>
    <section v-else-if="error && !world" class="center-state error-state"><span>☁</span><h2>暂时进不了小镇</h2><p>{{ error }}</p><button @click="load">重新连接</button></section>
    <template v-else-if="world">
      <div class="intro">
        <div><span class="eyebrow">WELCOME TO THE ISLAND</span><h1>今天，镇上会发生什么？</h1></div>
        <div class="intro-tools"><p>点击居民了解他们的故事，推进时间观察每个人如何做出选择。</p><div class="view-switch" aria-label="地图显示模式"><button :class="{ active: mapMode === 'classic' }" @click="mapMode = 'classic'">经典地图</button><button :class="{ active: mapMode === 'canvas' }" @click="mapMode = 'canvas'">动态 Canvas</button></div></div>
      </div>
      <div v-if="error" class="error-banner">{{ error }} <button @click="error = ''">×</button></div>
      <TownMap v-if="mapMode === 'classic'" :locations="world.locations" :npcs="world.npcs" :selected-id="selected?.id" :active-ids="activeIds" @select="selected = $event" />
      <CanvasTown v-else :locations="world.locations" :npcs="world.npcs" :active-ids="activeIds" @select="selected = $event" />
      <div class="resident-list">
        <button v-for="npc in world.npcs" :key="npc.id" :class="{ active: selected?.id === npc.id }" @click="selected = npc">
          <span class="mini-avatar" :style="{ background: npc.color }">{{ npc.emoji }}</span>
          <span><strong>{{ npc.name }}</strong><small>{{ npc.role }} · {{ npc.mood }}</small><i><em :style="{ width: `${npc.energy}%` }"></em></i></span><b>→</b>
        </button>
      </div>
      <TownQuests :quests="world.quests" />
      <TownJournal :events="world.events" :locations="world.locations" :npcs="world.npcs" />
      <transition name="panel"><NpcPanel v-if="selected" :npc="selected" :locations="world.locations" @close="selected = undefined" /></transition>
      <transition name="report"><TurnReport v-if="report" :report="report" :locations="world.locations" :npcs="world.npcs" :quests="world.quests" @close="report = undefined" /></transition>
      <div v-if="showReset" class="confirm-backdrop" @click.self="showReset = false"><div class="confirm-card"><span>↺</span><h2>重新开始这一天？</h2><p>回合、居民状态和小镇手记都会回到初始状态。</p><div><button @click="showReset = false">取消</button><button class="danger" @click="resetWorld">确认重置</button></div></div></div>
      <transition name="toast"><div v-if="toast" class="toast">✦ {{ toast }}</div></transition>
    </template>
  </main>
</template>
