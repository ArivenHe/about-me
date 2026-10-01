<script setup lang="ts">
import { ArrowUpRight, Github } from 'lucide-vue-next'
import ProjectArtwork from './ProjectArtwork.vue'
import type { Project } from '@/data/site'
defineProps<{ project: Project; index: number; gallery?: boolean }>()
const taglines: Record<string, string> = {
  aerionstudio: '连接每一次虚拟飞行。',
  'openatom-system': '一个社团。一整个系统。',
  'publish-site': '让代码，更快抵达世界。',
  'ai-vision': '让模型，看见真实世界。',
  'knowledge-os': '你的资料。新的答案。',
}
</script>

<template>
  <article :id="project.id" class="scene-project" :class="{ 'apple-chapter': !gallery, 'gallery-project': gallery, 'scene-paper': !gallery && index % 2 === 1, 'project-flight': project.visual === 'aerion' }" :data-scene="gallery ? undefined : 'project'" :aria-labelledby="`${project.id}-title`">
    <div :class="gallery ? 'gallery-project-stage' : 'chapter-stage'"><div class="shell scene-content">
      <div class="showcase-heading"><p class="chapter-label">{{ project.number }} / {{ project.status }}</p><h3 :id="`${project.id}-title`" class="scene-heading">{{ project.name }}</h3><p class="project-tagline">{{ taglines[project.id] }}</p></div>
      <div class="project-product scene-visual"><div class="product-frame"><ProjectArtwork :variant="project.visual" /><span class="visual-disclaimer">{{ project.visual === 'aerion' ? 'SYSTEM MAP · 架构示意' : 'VISUAL CONCEPT · 界面示意' }}</span></div></div>
      <div class="project-description scene-caption"><p>{{ project.description }}</p><div class="project-links"><a v-if="project.repository" :href="project.repository" target="_blank" rel="noopener noreferrer" :aria-label="`打开 ${project.name} 的 GitHub 仓库`"><Github :size="15" /> 查看代码 <ArrowUpRight :size="14" /></a><span v-else>{{ project.visual === 'aerion' ? '私有仓库 · 持续部署与维护' : '持续探索 · 代码暂未公开' }}</span><a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener noreferrer">在线体验 <ArrowUpRight :size="14" /></a><span class="project-stack">{{ project.tags.slice(0, 4).join(' / ') }}</span></div></div>
    </div></div>
  </article>
</template>
