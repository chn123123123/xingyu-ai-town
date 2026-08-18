<script setup lang="ts">
import type { Location, Npc, WorldEvent } from '../types';

const props = defineProps<{ events: WorldEvent[]; locations: Location[]; npcs: Npc[] }>();
const locationName = (id: string) => props.locations.find((place) => place.id === id)?.name ?? id;
</script>

<template>
  <section class="journal-section">
    <div class="section-heading">
      <div><span class="eyebrow">TOWN CHRONICLE</span><h2>小镇手记</h2></div>
      <p>居民真的相遇时，故事会被记录在这里。</p>
    </div>
    <div v-if="events.length" class="event-list">
      <article v-for="event in events.slice(0, 4)" :key="event.id">
        <time>第 {{ event.tick }} 回合<br>{{ event.time }}</time>
        <span class="event-mark">{{ event.type === 'encounter' ? '✦' : '♫' }}</span>
        <div><small>{{ locationName(event.locationId) }}</small><h3>{{ event.title }}</h3><p>{{ event.description }}</p></div>
        <div class="event-faces"><span v-for="npcId in event.npcIds" :key="npcId">{{ npcs.find((npc) => npc.id === npcId)?.emoji }}</span></div>
      </article>
    </div>
    <div v-else class="journal-empty"><span>◌</span><p>小镇手记还是空白的。多推进几个回合，居民们会在路上相遇。</p></div>
  </section>
</template>
