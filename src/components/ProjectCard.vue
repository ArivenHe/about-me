<script setup lang="ts">
import { ArrowUpRight, Github } from 'lucide-vue-next'
import type { Project } from '@/data/site'
import ProjectArtwork from './ProjectArtwork.vue'

defineProps<{ project: Project }>()
</script>

<template>
  <article :id="project.id" class="project-card parallax-layer" :class="{ 'project-featured': project.featured, 'project-aerion': project.visual === 'aerion' }">
    <div class="project-copy">
      <div class="project-topline"><span>{{ project.number }} / {{ project.eyebrow }}</span><span class="project-status"><i /> {{ project.status }}</span></div>
      <div class="project-text"><h3>{{ project.name }}</h3><p v-if="project.statement" class="project-statement">{{ project.statement }}</p><p>{{ project.description }}</p><div v-if="project.impact" class="project-impact"><i /> {{ project.impact }}</div></div>
      <div class="project-bottom"><div class="tag-list"><span v-for="tag in project.tags" :key="tag">{{ tag }}</span></div><div class="project-links"><a v-if="project.repository" :href="project.repository" target="_blank" rel="noopener noreferrer" :aria-label="`打开 ${project.name} 的 GitHub 仓库`"><Github :size="17" /> <span>Code</span><ArrowUpRight :size="14" /></a><span v-else class="project-unavailable">{{ project.visual === 'aerion' ? 'Private repository' : '代码暂未公开' }}</span><a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener noreferrer" :aria-label="`打开 ${project.name} 的演示网站`"><span>Demo</span><ArrowUpRight :size="14" /></a><span v-else class="project-unavailable">{{ project.visual === 'aerion' ? 'Private deployment' : 'Demo 暂未公开' }}</span></div></div>
    </div>
    <div class="project-image"><ProjectArtwork :variant="project.visual" /><span class="visual-disclaimer">{{ project.visual === 'aerion' ? 'SYSTEM MAP · 架构示意' : 'VISUAL CONCEPT · 界面示意' }}</span></div>
  </article>
</template>
