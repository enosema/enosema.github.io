import { ref, computed } from 'vue'

export interface ConceptPair {
  slogan: string
  filename: string
  code: string
}

// Examples are drawn from the Foundation's own published material: the
// construction/geospatial views of "building" and the screw/nail term clash
// appear in the launch announcement; the glossaries in scope are those its
// founders maintain.
export const conceptPairs: ConceptPair[] = [
  {
    slogan: 'between domains',
    filename: 'building.concept.yaml',
    code: '# shared concept register\nconcept: building\n  construction:\n    assembled from components,\n    seen from the ground up\n  geospatial:\n    composed of shapes,\n    seen from the top down\n  linked: true',
  },
  {
    slogan: 'between languages',
    filename: 'screw-nail.concept.yaml',
    code: '# one term, two concepts\nterm: "screw"\n  note: some languages name the\n  screw with the same term as\n  the nail\nissue: concept hierarchy mismatch\naction: link the concepts',
  },
  {
    slogan: 'between systems',
    filename: 'mappings.concept.yaml',
    code: '# harmonizing dictionaries\nsources:\n  - IEC Electropedia (IEV)\n  - ISO/TC 211 glossary\ngoal: mutual understanding\n  of entities\nstatus: in progress',
  },
]

const pairIndex = ref(0)
const typedText = ref(conceptPairs[0].code)
const currentPair = computed(() => conceptPairs[pairIndex.value])
let started = false
let typeTimer: ReturnType<typeof setInterval> | null = null
let pairTimer: ReturnType<typeof setInterval> | null = null

function startTyping() {
  if (typeTimer) clearInterval(typeTimer)
  const fullText = conceptPairs[pairIndex.value].code
  let i = 0
  typedText.value = ''
  typeTimer = setInterval(() => {
    if (i < fullText.length) {
      typedText.value += fullText[i]
      i++
    } else if (typeTimer) {
      clearInterval(typeTimer)
    }
  }, 22)
}

export function useConceptPairs() {
  if (!started) {
    started = true
    pairTimer = setInterval(() => {
      pairIndex.value = (pairIndex.value + 1) % conceptPairs.length
      startTyping()
    }, 7000)
  }
  return { pairIndex, typedText, currentPair, conceptPairs }
}
