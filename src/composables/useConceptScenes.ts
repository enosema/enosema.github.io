import { ref, computed } from 'vue'

export type EdgeType = 'generic' | 'partitive' | 'associative' | 'equivalence' | 'mapping' | 'hazard'

export interface SceneNode {
  id: string
  label: string
  sub?: string
  x: number
  y: number
  kind?: 'concept' | 'term'
  lang?: string
}

export interface SceneEdge {
  from: string
  to: string
  type: EdgeType
  label?: string
  detail: string
}

export interface SceneContainer {
  label: string
  sub?: string
  x: number
  y: number
  w: number
  h: number
}

export interface SceneLegendItem {
  type: EdgeType
  label: string
}

export interface Scene {
  id: string
  slogan: string
  tab: string
  filename: string
  hint: string
  nodes: SceneNode[]
  edges: SceneEdge[]
  containers?: SceneContainer[]
  legend: SceneLegendItem[]
}

// Scenes illustrate the Foundation's published specifications (enosema/docs):
// concept relationships per EFS 2507:2025, terminological equivalence across
// languages per EFS 2504:2025, and cross-register mapping per EFS 2501:2025.
// The fastener family is the term-clash example from the launch announcement.
export const scenes: Scene[] = [
  {
    id: 'relations',
    slogan: 'between domains',
    tab: 'relations',
    filename: 'concept-graph.relations.yaml',
    hint: 'Hover a node or edge to explore its relation type — EFS 2507:2025',
    nodes: [
      { id: 'fastener', label: 'fastener', x: 200, y: 52, kind: 'concept' },
      { id: 'screw', label: 'screw', x: 104, y: 156 },
      { id: 'nail', label: 'nail', x: 296, y: 156 },
      { id: 'thread', label: 'thread', x: 58, y: 252 },
    ],
    edges: [
      {
        from: 'screw',
        to: 'fastener',
        type: 'generic',
        label: 'is-a',
        detail: 'Generic (is-a): the specific inherits all characteristics of the general — “oak” is-a “tree”, “laptop” is-a “computer”. EFS 2507',
      },
      {
        from: 'nail',
        to: 'fastener',
        type: 'generic',
        label: 'is-a',
        detail: 'Generic relationships build the taxonomies that let domains share one concept system. EFS 2507',
      },
      {
        from: 'thread',
        to: 'screw',
        type: 'partitive',
        label: 'part-of',
        detail: 'Partitive (part-of): “wheel” is part of “car”, “chapter” is part of “book”. EFS 2507',
      },
      {
        from: 'screw',
        to: 'nail',
        type: 'associative',
        label: 'contrasted with',
        detail: 'Associative: semantically related, not hierarchical — cause and effect, tool and function. EFS 2507',
      },
    ],
    legend: [
      { type: 'generic', label: 'generic (is-a)' },
      { type: 'partitive', label: 'partitive (part-of)' },
      { type: 'associative', label: 'associative' },
    ],
  },
  {
    id: 'languages',
    slogan: 'between languages',
    tab: 'languages',
    filename: 'concept-graph.languages.yaml',
    hint: 'One concept, full equivalents in every language — EFS 2504:2025',
    nodes: [
      { id: 'oxygen', label: 'oxygen', sub: 'concept · atomic number 8', x: 200, y: 56, kind: 'concept' },
      { id: 'en', label: 'oxygen', lang: 'en', x: 62, y: 178, kind: 'term' },
      { id: 'fr', label: 'oxygène', lang: 'fr', x: 153, y: 250, kind: 'term' },
      { id: 'de', label: 'Sauerstoff', lang: 'de', x: 247, y: 250, kind: 'term' },
      { id: 'ja', label: '酸素', lang: 'ja', x: 338, y: 178, kind: 'term' },
    ],
    edges: [
      { from: 'oxygen', to: 'en', type: 'equivalence', detail: 'en · oxygen — full equivalence. EFS 2504' },
      { from: 'oxygen', to: 'fr', type: 'equivalence', detail: 'fr · oxygène — full equivalence. EFS 2504' },
      { from: 'oxygen', to: 'de', type: 'equivalence', detail: 'de · Sauerstoff — full equivalence. EFS 2504' },
      { from: 'oxygen', to: 'ja', type: 'equivalence', detail: 'ja · 酸素 — full equivalence. EFS 2504' },
    ],
    legend: [{ type: 'equivalence', label: 'full equivalence (cross-language)' }],
  },
  {
    id: 'systems',
    slogan: 'between systems',
    tab: 'systems',
    filename: 'concept-graph.systems.yaml',
    hint: 'Map concepts, not terms — harmonizing IEV with the ISO/TC 211 MLGT',
    nodes: [
      { id: 'iev-current', label: 'current', sub: 'electric', x: 100, y: 120, kind: 'term' },
      { id: 'iev-em', label: 'electromagnetic', sub: 'wave', x: 100, y: 214, kind: 'term' },
      { id: 'tc-current', label: 'current', sub: 'ocean', x: 300, y: 120, kind: 'term' },
      { id: 'tc-em', label: 'electromagnetic', sub: 'radiation', x: 300, y: 214, kind: 'term' },
    ],
    edges: [
      {
        from: 'iev-em',
        to: 'tc-em',
        type: 'mapping',
        label: 'same concept',
        detail: 'Identical concept under different designations, mapped register to register. EFS 2501',
      },
      {
        from: 'iev-current',
        to: 'tc-current',
        type: 'hazard',
        label: 'same term',
        detail: 'Same designation, different concepts — the classic cross-register hazard. EFS 2501',
      },
    ],
    containers: [
      { label: 'IEC Electropedia', sub: '(IEV)', x: 8, y: 24, w: 184, h: 236 },
      { label: 'ISO/TC 211', sub: 'Multi-Lingual Glossary of Terms', x: 208, y: 24, w: 184, h: 236 },
    ],
    legend: [
      { type: 'mapping', label: 'same concept, different terms' },
      { type: 'hazard', label: 'same term, different concepts' },
    ],
  },
]

const sceneIndex = ref(0)
const paused = ref(false)
const currentScene = computed(() => scenes[sceneIndex.value])
let rotateTimer: ReturnType<typeof setInterval> | null = null

export function useConceptScenes() {
  if (!rotateTimer) {
    rotateTimer = setInterval(() => {
      if (!paused.value) {
        sceneIndex.value = (sceneIndex.value + 1) % scenes.length
      }
    }, 7000)
  }

  function setScene(i: number) {
    sceneIndex.value = i
  }

  return { scenes, sceneIndex, currentScene, setScene, pause: () => (paused.value = true), resume: () => (paused.value = false) }
}
