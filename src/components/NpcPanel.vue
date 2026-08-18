<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { api } from '../api';
import type { Location, Npc } from '../types';

const props = defineProps<{ npc: Npc; locations: Location[] }>();
const emit = defineEmits<{ close: [] }>();
const detail = ref<Npc>(props.npc);
const message = ref('');
const sending = ref(false);
const chatError = ref('');
const messages = ref<Array<{ from: 'player' | 'npc'; text: string; mode?: string }>>([]);
const chatEnd = ref<HTMLElement>();
const locationName = computed(() => props.locations.find((item) => item.id === detail.value.locationId)?.name ?? '未知');

async function loadDetail() {
  try { detail.value = await api.getNpc(props.npc.id); } catch { detail.value = props.npc; }
}

watch(() => props.npc, async () => { messages.value = []; await loadDetail(); }, { immediate: true });

async function send() {
  const text = message.value.trim();
  if (!text || sending.value) return;
  message.value = '';
  messages.value.push({ from: 'player', text });
  sending.value = true;
  chatError.value = '';
  try {
    const result = await api.chat(detail.value.id, text);
    messages.value.push({ from: 'npc', text: result.reply, mode: result.mode });
  } catch (error) { chatError.value = error instanceof Error ? error.message : '发送失败'; }
  finally { sending.value = false; await nextTick(); chatEnd.value?.scrollIntoView({ behavior: 'smooth' }); }
}
</script>

<template>
  <aside class="npc-panel">
    <button class="close-button" aria-label="关闭详情" @click="emit('close')">×</button>
    <div class="profile-head">
      <div class="big-avatar" :style="{ background: detail.color }">{{ detail.emoji }}</div>
      <div><span class="eyebrow">TOWN RESIDENT</span><h2>{{ detail.name }}</h2><p>{{ detail.role }} · {{ detail.mood }}</p></div>
    </div>
    <div class="tag-row"><span>{{ detail.personality.split('、')[0] }}</span><span>{{ locationName }}</span><span>精力 {{ detail.energy }}</span></div>
    <p class="personality">“{{ detail.personality }}”</p>
    <div class="aspiration"><span>✦ 心愿</span><p>{{ detail.aspiration }}</p></div>

    <div class="energy-meter"><span>精力状态</span><div><i :style="{ width: `${detail.energy}%` }"></i></div><b>{{ detail.energy }}/100</b></div>

    <div class="now-card"><span>此刻正在</span><strong>{{ detail.currentAction }}</strong></div>

    <section class="memory-section">
      <h3>最近的行动</h3>
      <div v-if="!detail.memories.length" class="empty-memory">新的一天刚刚开始，推进回合看看会发生什么。</div>
      <div v-for="memory in detail.memories.slice(0, 3)" :key="`${memory.tick}-${memory.action}`" class="memory-item">
        <span>{{ memory.time }}</span><div><strong>{{ memory.description }}</strong><p>{{ memory.reason }}</p></div>
      </div>
    </section>

    <section class="chat-section">
      <h3>和 {{ detail.name }} 聊聊</h3>
      <div class="chat-window">
        <p v-if="!messages.length" class="chat-hint">试着问问今天的计划，或者打个招呼。</p>
        <div v-for="(item, index) in messages" :key="index" class="message" :class="item.from">
          {{ item.text }} <small v-if="item.mode">{{ item.mode }}</small>
        </div>
        <div v-if="sending" class="message npc typing">正在想…</div>
        <div ref="chatEnd"></div>
      </div>
      <p v-if="chatError" class="inline-error">{{ chatError }}</p>
      <form class="chat-form" @submit.prevent="send">
        <input v-model="message" maxlength="200" :placeholder="`对${detail.name}说…`" aria-label="聊天内容" />
        <button :disabled="sending || !message.trim()">发送</button>
      </form>
    </section>
  </aside>
</template>
