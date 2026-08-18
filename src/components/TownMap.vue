<script setup lang="ts">
import type { Location, Npc } from '../types';

defineProps<{ locations: Location[]; npcs: Npc[]; selectedId?: string; activeIds?: string[] }>();
const emit = defineEmits<{ select: [npc: Npc] }>();
</script>

<template>
  <section class="town-map" aria-label="星屿镇地图">
    <div class="river"></div>
    <div class="path path-one"></div>
    <div class="path path-two"></div>
    <div
      v-for="place in locations" :key="place.id" class="place"
      :style="{ left: `${place.position.x}%`, top: `${place.position.y}%` }"
    >
      <div class="place-building">{{ place.icon }}</div>
      <span class="occupancy">{{ npcs.filter((item) => item.locationId === place.id).length }} 位居民</span>
      <strong>{{ place.name }}</strong>
      <span>{{ place.description }}</span>
      <div class="npc-row">
        <button
          v-for="npc in npcs.filter((item) => item.locationId === place.id)" :key="npc.id"
          class="map-npc" :class="{ selected: selectedId === npc.id, updated: activeIds?.includes(npc.id) }" :style="{ '--npc-color': npc.color }"
          :aria-label="`查看${npc.name}`" @click="emit('select', npc)"
        >
          <span class="npc-avatar">{{ npc.emoji }}</span>
          <span class="npc-name">{{ npc.name }}</span>
          <span class="action-bubble"><b>{{ npc.mood }} · 精力 {{ npc.energy }}</b>{{ npc.currentAction }}</span>
        </button>
      </div>
    </div>
    <div class="map-label">STARLIGHT ISLE · 04</div>
  </section>
</template>
