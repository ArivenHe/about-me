<script setup lang="ts">
import 'simple-liquid-glass/web-component'
withDefaults(defineProps<{ radius?: number; strength?: number }>(), { radius: 32, strength: 38 })
</script>

<template>
  <liquid-glass class="liquid-surface" :radius="String(radius)" :scale="String(strength * 0.4)" lens="rim" lens-strength="0.32" frost="0.11" blur="1.2" saturation="135" lightness="48" alpha="0.75" border-color="rgba(210,225,255,0.28)"><slot /></liquid-glass>
</template>

<style scoped>
.liquid-surface { display: block; overflow: clip; clip-path: inset(0 round v-bind('`${radius}px`')); border-radius: v-bind('`${radius}px`'); background: #121923aa; box-shadow: inset 0 1px 1px #ffffff38, inset 0 -1px 1px #a5caff20, 0 12px 38px #0003; }
</style>
