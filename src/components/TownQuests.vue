<script setup lang="ts">
import type { Quest } from '../types';

defineProps<{ quests: Quest[] }>();
</script>

<template>
  <section class="quest-section" aria-labelledby="quest-title">
    <div class="quest-heading">
      <div><span class="eyebrow">TOWN REQUESTS</span><h2 id="quest-title">小镇委托</h2></div>
      <p>{{ quests.filter((quest) => quest.completedAt !== null).length }}/{{ quests.length }} 已完成</p>
    </div>
    <div class="quest-grid">
      <article v-for="quest in quests" :key="quest.id" :class="{ completed: quest.completedAt !== null }">
        <span class="quest-icon">{{ quest.completedAt !== null ? '✓' : quest.icon }}</span>
        <div class="quest-copy">
          <div><h3>{{ quest.title }}</h3><b>{{ quest.progress }}/{{ quest.target }}</b></div>
          <p>{{ quest.description }}</p>
          <div class="quest-progress"><i :style="{ width: `${(quest.progress / quest.target) * 100}%` }"></i></div>
          <small>{{ quest.completedAt !== null ? `第 ${quest.completedAt} 回合完成 · ${quest.reward}` : quest.reward }}</small>
        </div>
      </article>
    </div>
  </section>
</template>
