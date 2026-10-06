<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useConceptScenes, type SceneNode, type SceneEdge, type EdgeType } from '@/composables/useConceptScenes'

const { scenes, sceneIndex, currentScene, setScene, pause, resume } = useConceptScenes()

const hoverId = ref<string | null>(null)
const langIndex = ref(0)
const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let langTimer: ReturnType<typeof setInterval> | null = null
watch(
  () => currentScene.value.id,
  () => {
    langIndex.value = 0
    hoverId.value = null
  }
)

onMounted(() => {
  if (reducedMotion) pause()
  langTimer = setInterval(() => {
    if (currentScene.value.id === 'languages' && !reducedMotion) {
      langIndex.value = (langIndex.value + 1) % currentScene.value.nodes.filter((n) => n.kind === 'term').length
    }
  }, 2000)
})
onUnmounted(() => {
  if (langTimer) clearInterval(langTimer)
})

const strokeClass: Record<EdgeType, string> = {
  generic: 'stroke-eno-green dark:stroke-eno-green-light',
  partitive: 'stroke-eno-green dark:stroke-eno-green-light',
  associative: 'stroke-gray-400 dark:stroke-gray-500',
  equivalence: 'stroke-eno-green dark:stroke-eno-green-light',
  mapping: 'stroke-eno-green dark:stroke-eno-green-light',
  hazard: 'stroke-red-500 dark:stroke-red-400',
}

const dash: Partial<Record<EdgeType, string>> = {
  partitive: '6 4',
  associative: '1.5 4',
  hazard: '6 4',
}

function nodeById(id: string): SceneNode {
  return currentScene.value.nodes.find((n) => n.id === id)!
}

function nodeSize(n: SceneNode) {
  const w = Math.max(56, n.label.length * 7.2 + (n.kind === 'concept' ? 28 : 20), (n.sub?.length ?? 0) * 6 + 20)
  return { w, h: n.sub ? 40 : 27 }
}

function trim(from: SceneNode, to: SceneNode) {
  const fs = nodeSize(from)
  const ts = nodeSize(to)
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len
  const fromOff = Math.min(fs.w / 2 / Math.abs(ux || 1e-9), fs.h / 2 / Math.abs(uy || 1e-9)) + 5
  const toOff = Math.min(ts.w / 2 / Math.abs(ux || 1e-9), ts.h / 2 / Math.abs(uy || 1e-9)) + 6
  return {
    x1: from.x + ux * fromOff,
    y1: from.y + uy * fromOff,
    x2: to.x - ux * toOff,
    y2: to.y - uy * toOff,
    ux,
    uy,
    nx: -uy,
    ny: ux,
  }
}

function edgeGeom(e: SceneEdge) {
  const g = trim(nodeById(e.from), nodeById(e.to))
  const arrow = e.type === 'generic' || e.type === 'partitive' || e.type === 'mapping'
  return { ...g, arrow }
}

function arrowPoints(e: SceneEdge) {
  const g = edgeGeom(e)
  const tip = { x: g.x2, y: g.y2 }
  const back = { x: g.x2 - g.ux * 9, y: g.y2 - g.uy * 9 }
  return `${tip.x},${tip.y} ${back.x + g.nx * 4},${back.y + g.ny * 4} ${back.x - g.nx * 4},${back.y - g.ny * 4}`
}

function edgeLabelPos(e: SceneEdge, i: number) {
  const g = edgeGeom(e)
  const mx = (g.x1 + g.x2) / 2
  const my = (g.y1 + g.y2) / 2
  let nx = g.nx
  let ny = g.ny
  if (ny > 0) {
    nx = -nx
    ny = -ny
  }
  return { x: mx + nx * 10, y: my + ny * 10, key: i }
}

const directed: EdgeType[] = ['generic', 'partitive', 'mapping']

function edgeActive(e: SceneEdge, i: number) {
  if (!hoverId.value) return true
  if (hoverId.value === 'e' + i) return true
  if (hoverId.value.startsWith('e')) return false
  return e.from === hoverId.value || e.to === hoverId.value
}

function nodeActive(id: string) {
  if (!hoverId.value) return true
  if (hoverId.value === id) return true
  if (hoverId.value.startsWith('e')) {
    const e = currentScene.value.edges[Number(hoverId.value.slice(1))]
    return !!e && (e.from === id || e.to === id)
  }
  return currentScene.value.edges.some((e) => (e.from === hoverId.value && e.to === id) || (e.to === hoverId.value && e.from === id))
}

const activeTermId = computed(() => {
  if (currentScene.value.id !== 'languages') return null
  const terms = currentScene.value.nodes.filter((n) => n.kind === 'term')
  return terms[langIndex.value]?.id ?? null
})

const detail = computed(() => {
  if (hoverId.value) {
    if (hoverId.value.startsWith('e')) {
      return currentScene.value.edges[Number(hoverId.value.slice(1))]?.detail ?? ''
    }
    const n = currentScene.value.nodes.find((x) => x.id === hoverId.value)
    if (n) {
      const rel = currentScene.value.edges
        .filter((e) => e.from === n.id || e.to === n.id)
        .map((e) => `${e.label ?? e.type}`)
        .join(' · ')
      return rel ? `${n.lang ? n.lang + ' · ' : ''}${n.label} — ${rel}` : currentScene.value.hint
    }
  }
  if (activeTermId.value) {
    const e = currentScene.value.edges.find((x) => x.to === activeTermId.value)
    return e?.detail ?? currentScene.value.hint
  }
  return currentScene.value.hint
})
</script>

<template>
  <div
    class="w-full rounded-2xl border border-gray-200/60 dark:border-gray-700/40 bg-white dark:bg-pine-light shadow-2xl shadow-eno-green/5 dark:shadow-black/20 overflow-hidden"
    @mouseenter="pause"
    @mouseleave="resume"
    @focusin="pause"
    @focusout="resume"
  >
    <div class="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/40 bg-gray-50/80 dark:bg-pine">
      <span class="w-2.5 h-2.5 rounded-full bg-red-400/70" />
      <span class="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
      <Transition mode="out-in" enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <span :key="currentScene.filename" class="ml-2 text-[0.7rem] font-mono text-gray-400 dark:text-gray-500 truncate">{{ currentScene.filename }}</span>
      </Transition>
    </div>

    <div class="px-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-700/40">
      <div class="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-pine border border-gray-200/60 dark:border-gray-700/40" role="tablist" aria-label="Concept graph scenes">
        <button
          v-for="(s, i) in scenes"
          :key="s.id"
          role="tab"
          :aria-selected="i === sceneIndex"
          class="flex-1 px-3 py-1.5 rounded-md text-xs font-mono tracking-wide transition-all duration-150"
          :class="i === sceneIndex
            ? 'bg-white dark:bg-pine-light shadow-sm font-bold text-eno-green-dark dark:text-eno-green-light'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'"
          @click="setScene(i)"
        >
          {{ s.tab }}
        </button>
      </div>
    </div>

    <svg viewBox="0 0 400 300" class="block w-full" role="img" :aria-label="`Concept graph: ${currentScene.slogan}`">
      <defs>
        <pattern id="graph-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" class="fill-gray-200 dark:fill-gray-700" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(#graph-dots)" opacity="0.5" />

      <Transition mode="out-in" enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <g :key="currentScene.id">
          <g v-if="currentScene.containers">
            <rect
              v-for="c in currentScene.containers"
              :key="c.label"
              :x="c.x" :y="c.y" :width="c.w" :height="c.h" rx="12"
              class="fill-transparent stroke-gray-300 dark:stroke-gray-600"
              stroke-dasharray="5 5"
            />
            <text
              v-for="c in currentScene.containers"
              :key="c.label + '-label'"
              :x="c.x + 12" :y="c.y + 18"
              class="fill-gray-400 dark:fill-gray-500 font-mono"
              font-size="10"
            >{{ c.label }}</text>
            <text
              v-for="c in currentScene.containers.filter((x) => x.sub)"
              :key="c.label + '-sub'"
              :x="c.x + 12" :y="c.y + 31"
              class="fill-gray-400 dark:fill-gray-500 font-mono"
              font-size="8.5"
            >{{ c.sub }}</text>
          </g>

          <g v-for="(e, i) in currentScene.edges" :key="currentScene.id + '-e' + i" :class="edgeActive(e, i) ? 'opacity-100' : 'opacity-25'" class="transition-opacity duration-200">
            <line
              v-for="o in e.type === 'equivalence' ? [-2.4, 2.4] : [0]"
              :key="o"
              :x1="edgeGeom(e).x1 + edgeGeom(e).nx * o"
              :y1="edgeGeom(e).y1 + edgeGeom(e).ny * o"
              :x2="edgeGeom(e).x2 + edgeGeom(e).nx * o"
              :y2="edgeGeom(e).y2 + edgeGeom(e).ny * o"
              :class="['stroke-[1.6]', strokeClass[e.type]]"
              :stroke-dasharray="dash[e.type]"
              :stroke-linecap="e.type === 'associative' ? 'round' : undefined"
            />
            <polygon v-if="directed.includes(e.type)" :points="arrowPoints(e)" class="fill-eno-green dark:fill-eno-green-light" />
            <text
              v-if="e.label"
              :x="edgeLabelPos(e, i).x"
              :y="edgeLabelPos(e, i).y"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="9"
              class="fill-gray-400 dark:fill-gray-500 font-mono"
              paint-order="stroke"
              stroke-width="3"
            >{{ e.label }}</text>
            <line
              :x1="edgeGeom(e).x1" :y1="edgeGeom(e).y1" :x2="edgeGeom(e).x2" :y2="edgeGeom(e).y2"
              stroke="transparent" stroke-width="14" class="cursor-help"
              @mouseenter="hoverId = 'e' + i"
              @mouseleave="hoverId = null"
            />
          </g>

          <g v-for="n in currentScene.nodes" :key="currentScene.id + '-' + n.id" :class="nodeActive(n.id) ? 'opacity-100' : 'opacity-30'" class="transition-opacity duration-200">
            <rect
              :x="n.x - nodeSize(n).w / 2"
              :y="n.y - nodeSize(n).h / 2"
              :width="nodeSize(n).w"
              :height="nodeSize(n).h"
              rx="9"
              :class="n.kind === 'concept'
                ? 'fill-eno-green/10 stroke-eno-green dark:fill-eno-green/15 dark:stroke-eno-green-light'
                : 'fill-white stroke-eno-green/40 dark:fill-pine-light dark:stroke-eno-green-light/30'"
              stroke-width="1.2"
            />
            <rect
              v-if="n.id === activeTermId"
              :x="n.x - nodeSize(n).w / 2 - 3"
              :y="n.y - nodeSize(n).h / 2 - 3"
              :width="nodeSize(n).w + 6"
              :height="nodeSize(n).h + 6"
              rx="11"
              fill="none"
              class="stroke-eno-green dark:stroke-eno-green-light"
              stroke-width="1.4"
            />
            <text
              :x="n.x"
              :y="n.sub ? n.y - 4 : n.y"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="12"
              class="font-mono cursor-default"
              :class="n.kind === 'concept'
                ? 'fill-eno-green-dark dark:fill-eno-green-light font-bold'
                : n.id === activeTermId
                  ? 'fill-eno-green-dark dark:fill-eno-green-light'
                  : 'fill-gray-700 dark:fill-gray-200'"
            >{{ n.label }}</text>
            <text v-if="n.sub" :x="n.x" :y="n.y + 10" text-anchor="middle" dominant-baseline="middle" font-size="9" class="fill-gray-500 dark:fill-gray-400 font-mono">{{ n.sub }}</text>
            <rect
              :x="n.x - nodeSize(n).w / 2"
              :y="n.y - nodeSize(n).h / 2"
              :width="nodeSize(n).w"
              :height="nodeSize(n).h"
              rx="9"
              fill="transparent"
              class="cursor-pointer"
              @mouseenter="hoverId = n.id"
              @mouseleave="hoverId = null"
            />
          </g>
        </g>
      </Transition>
    </svg>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 border-t border-gray-100 dark:border-gray-700/40">
      <span v-for="l in currentScene.legend" :key="l.type + l.label" class="inline-flex items-center gap-1.5 text-[0.65rem] font-mono text-gray-400 dark:text-gray-500">
        <svg width="24" height="8" class="overflow-visible">
          <line v-for="o in l.type === 'equivalence' ? [-2, 2] : [0]" :key="o" x1="1" :y1="4 + o" x2="23" :y2="4 + o" :class="['stroke-[1.6]', strokeClass[l.type]]" :stroke-dasharray="dash[l.type]" />
        </svg>
        {{ l.label }}
      </span>
    </div>

    <div class="h-10 px-4 py-2 border-t border-gray-100 dark:border-gray-700/40 bg-gray-50/60 dark:bg-pine/60">
      <Transition mode="out-in" enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <p :key="detail" class="m-0 text-[0.68rem] font-mono text-gray-500 dark:text-gray-400 truncate">{{ detail }}</p>
      </Transition>
    </div>
  </div>
</template>
