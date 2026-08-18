<script setup lang="ts">
import type { Location, Npc, Quest, TurnReport } from '../types';

const props = defineProps<{ report: TurnReport; locations: Location[]; npcs: Npc[]; quests: Quest[] }>();
const emit = defineEmits<{ close: [] }>();
const actionLabels: Record<string, string> = { move: '移动', work: '工作', rest: '休息', socialize: '社交' };
const actionIcons: Record<string, string> = { move: '↗', work: '◆', rest: '☾', socialize: '✦' };
const locationName = (id: string) => props.locations.find((place) => place.id === id)?.name ?? id;
const npc = (id: string) => props.npcs.find((item) => item.id === id);
</script>

<template>
  <div class="report-backdrop" @click.self="emit('close')">
    <section class="turn-report" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <button class="report-close" aria-label="关闭回合报告" @click="emit('close')">×</button>
      <header>
        <span class="report-kicker">TURN {{ report.tick }} · {{ report.time }}</span>
        <h2 id="report-title">这一回合，星屿镇发生了什么？</h2>
        <p>{{ report.headline }}</p>
      </header>
      <div class="decision-grid">
        <article v-for="decision in report.decisions" :key="decision.npcId" class="decision-card">
          <div class="decision-person">
            <span :style="{ background: npc(decision.npcId)?.color }">{{ npc(decision.npcId)?.emoji }}</span>
            <div><strong>{{ decision.npcName }}</strong><small>{{ npc(decision.npcId)?.role }}</small></div>
            <em :class="decision.source.toLowerCase()">{{ decision.source }}</em>
          </div>
          <div class="action-line"><b>{{ actionIcons[decision.action] }}</b><span>{{ actionLabels[decision.action] }} · {{ locationName(decision.toLocationId) }}</span></div>
          <p>{{ decision.reason }}</p>
          <footer>
            <span v-if="decision.fromLocationId !== decision.toLocationId">{{ locationName(decision.fromLocationId) }} → {{ locationName(decision.toLocationId) }}</span>
            <span v-else>留在 {{ locationName(decision.toLocationId) }}</span>
            <b :class="{ positive: decision.energyAfter > decision.energyBefore }">精力 {{ decision.energyAfter - decision.energyBefore > 0 ? '+' : '' }}{{ decision.energyAfter - decision.energyBefore }}</b>
          </footer>
        </article>
      </div>
      <div v-if="report.events.length" class="encounter-card">
        <span class="encounter-icon">✦</span>
        <div><small>TOWN STORY</small><strong>{{ report.events[0].title }}</strong><p>{{ report.events[0].description }}</p></div>
      </div>
      <div v-for="questId in report.completedQuestIds ?? []" :key="questId" class="quest-complete-card">
        <span>✓</span><div><small>REQUEST COMPLETED</small><strong>{{ quests.find((quest) => quest.id === questId)?.title }}</strong><p>{{ quests.find((quest) => quest.id === questId)?.reward }}</p></div>
      </div>
      <button class="continue-button" @click="emit('close')">回到小镇继续观察 <span>→</span></button>
    </section>
  </div>
</template>
