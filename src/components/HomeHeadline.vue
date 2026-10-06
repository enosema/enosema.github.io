<script setup lang="ts">
import { useConceptScenes } from '@/composables/useConceptScenes'

const { currentScene } = useConceptScenes()
</script>

<template>
  <div>
    <h1 class="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif font-bold text-gray-900 dark:text-white leading-[1.15] tracking-tight">
      Bridging the
      <span class="relative inline-block text-eno-green dark:text-eno-green-light">
        semantic gap
        <span class="absolute bottom-1 left-0 right-0 h-3 bg-eno-green/10 dark:bg-eno-green-light/10 -skew-x-2 pointer-events-none" />
      </span>
      <Transition
        mode="out-in"
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-3"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <span :key="currentScene.slogan" class="relative block mt-1 text-eno-green dark:text-eno-green-light">
          {{ currentScene.slogan }}
        </span>
      </Transition>
    </h1>
  </div>
</template>
