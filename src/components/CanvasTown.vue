<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { Location, Npc } from '../types';

const props = defineProps<{ locations: Location[]; npcs: Npc[]; activeIds?: string[] }>();
const emit = defineEmits<{ select: [npc: Npc] }>();
const canvas = ref<HTMLCanvasElement>();
let frame = 0;
let observer: ResizeObserver | undefined;
let hitAreas: Array<{ npc: Npc; x: number; y: number; radius: number }> = [];
const motes = Array.from({ length: 34 }, (_, index) => ({
  x: ((index * 47) % 100) / 100, y: ((index * 71) % 100) / 100,
  size: 1 + (index % 3), speed: .00012 + (index % 5) * .000025, phase: index * .73,
}));

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); ctx.fill();
}

function draw() {
  const element = canvas.value;
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const ratio = Math.min(devicePixelRatio || 1, 2);
  if (element.width !== Math.round(rect.width * ratio) || element.height !== Math.round(rect.height * ratio)) {
    element.width = Math.round(rect.width * ratio); element.height = Math.round(rect.height * ratio);
  }
  const ctx = element.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const width = rect.width; const height = rect.height; const time = performance.now();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#dce6c8'; ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#c5d4ad';
  for (let x = 8; x < width; x += 14) for (let y = 8; y < height; y += 14) ctx.fillRect(x, y, 1, 1);

  ctx.fillStyle = '#a8d3cf'; ctx.beginPath();
  ctx.moveTo(width * .5, -10); ctx.lineTo(width * .67, -10); ctx.lineTo(width * .58, height + 10); ctx.lineTo(width * .39, height + 10); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#86bab5'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1;
  for (let line = 0; line < 5; line += 1) {
    const y = ((time * .025 + line * 130) % (height + 80)) - 40;
    ctx.beginPath(); ctx.moveTo(width * .45, y); ctx.quadraticCurveTo(width * .53, y + 16, width * .62, y); ctx.stroke();
  }

  ctx.strokeStyle = '#e8d7b4'; ctx.lineWidth = Math.max(12, width * .016); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(width * .12, height * .51); ctx.lineTo(width * .88, height * .28); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(width * .35, height * .12); ctx.lineTo(width * .58, height * .9); ctx.stroke();

  for (const mote of motes) {
    const y = (mote.y + time * mote.speed) % 1;
    const alpha = .25 + Math.sin(time * .002 + mote.phase) * .18;
    ctx.fillStyle = `rgba(255,247,180,${alpha})`; ctx.beginPath(); ctx.arc(mote.x * width, y * height, mote.size, 0, Math.PI * 2); ctx.fill();
  }

  hitAreas = [];
  for (const place of props.locations) {
    const x = place.position.x / 100 * width; const y = place.position.y / 100 * height;
    ctx.fillStyle = 'rgba(255,250,239,.92)'; roundedRect(ctx, x - 48, y - 39, 96, 73, 20);
    ctx.strokeStyle = '#cdbf9f'; ctx.lineWidth = 2; ctx.strokeRect(x - 41, y - 32, 82, 59);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `${Math.max(26, width * .026)}px sans-serif`; ctx.fillText(place.icon, x, y - 5);
    ctx.fillStyle = '#30463c'; ctx.font = `700 ${Math.max(11, width * .012)}px serif`; ctx.fillText(place.name, x, y + 49);
    const residents = props.npcs.filter((npc) => npc.locationId === place.id);
    residents.forEach((npc, index) => {
      const angle = residents.length === 1 ? 0 : (index / residents.length) * Math.PI * 2;
      const nx = x + 58 + Math.cos(angle) * 22; const ny = y - 12 + Math.sin(angle) * 25;
      const pulse = props.activeIds?.includes(npc.id) ? 5 + Math.sin(time * .012) * 4 : 0;
      if (pulse) { ctx.strokeStyle = 'rgba(246,189,96,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(nx, ny, 22 + pulse, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = npc.color; ctx.beginPath(); ctx.arc(nx, ny, 21, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff9e9'; ctx.lineWidth = 3; ctx.stroke();
      ctx.font = '20px sans-serif'; ctx.fillStyle = '#26362f'; ctx.fillText(npc.emoji, nx, ny);
      ctx.fillStyle = '#fffaf0'; roundedRect(ctx, nx - 21, ny + 23, 42, 17, 8);
      ctx.fillStyle = '#33483f'; ctx.font = '9px sans-serif'; ctx.fillText(npc.name, nx, ny + 32);
      hitAreas.push({ npc, x: nx, y: ny, radius: 28 });
    });
  }
  ctx.fillStyle = 'rgba(49,72,61,.55)'; ctx.textAlign = 'right'; ctx.font = '8px sans-serif'; ctx.fillText('CANVAS OBSERVATORY · LIVE', width - 17, height - 14);
  frame = requestAnimationFrame(draw);
}

function pointerPosition(event: MouseEvent) {
  const rect = canvas.value!.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
function onClick(event: MouseEvent) {
  const point = pointerPosition(event);
  const hit = hitAreas.find((area) => Math.hypot(point.x - area.x, point.y - area.y) <= area.radius);
  if (hit) emit('select', hit.npc);
}
function onMove(event: MouseEvent) {
  const point = pointerPosition(event);
  canvas.value!.style.cursor = hitAreas.some((area) => Math.hypot(point.x - area.x, point.y - area.y) <= area.radius) ? 'pointer' : 'default';
}

onMounted(() => {
  observer = new ResizeObserver(draw); if (canvas.value) observer.observe(canvas.value); draw();
});
onBeforeUnmount(() => { cancelAnimationFrame(frame); observer?.disconnect(); });
</script>

<template>
  <section class="canvas-town" aria-label="Canvas 动态小镇">
    <canvas ref="canvas" @click="onClick" @mousemove="onMove"></canvas>
    <div class="sr-only">
      <button v-for="npc in npcs" :key="npc.id" @click="emit('select', npc)">查看{{ npc.name }}</button>
    </div>
    <div class="canvas-live"><i></i> LIVE CANVAS</div>
  </section>
</template>
