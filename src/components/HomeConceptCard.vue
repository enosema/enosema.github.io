<script setup lang="ts">
import { useConceptPairs } from '@/composables/useConceptPairs'

const { typedText, currentPair } = useConceptPairs()
</script>

<template>
  <div class="w-full rounded-2xl border border-gray-200/60 dark:border-gray-700/40 bg-white dark:bg-pine-light shadow-2xl shadow-eno-green/5 dark:shadow-black/20 overflow-hidden">
    <div class="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/40 bg-gray-50/80 dark:bg-pine">
      <span class="w-2.5 h-2.5 rounded-full bg-red-400/70" />
      <span class="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
      <Transition mode="out-in" enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <span :key="currentPair.filename" class="ml-2 text-[0.7rem] font-mono text-gray-400 dark:text-gray-500">{{ currentPair.filename }}</span>
      </Transition>
    </div>
    <pre class="p-5 m-0 font-mono text-[0.8rem] leading-[1.8] text-gray-700 dark:text-gray-300 h-[15rem] whitespace-pre-wrap">{{ typedText }}<span class="inline-block w-[2px] h-[1.1em] bg-eno-green dark:bg-eno-green-light align-middle animate-[cursor-blink_1s_step-end_infinite]" /></pre>
  </div>
</template>
