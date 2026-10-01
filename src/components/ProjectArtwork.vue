<script setup lang="ts">
import { Plane } from 'lucide-vue-next'
import type { Project } from '@/data/site'

defineProps<{ variant: Project['visual'] }>()
</script>

<template>
  <div class="project-artwork" :class="`artwork-${variant}`" aria-hidden="true">
    <div v-if="variant === 'aerion'" class="aerion-scene">
      <div class="aerion-header"><span>AERIONSTUDIO <i>/</i> SYSTEM OVERVIEW</span><span class="aerion-live"><b /> PRIVATE NETWORK</span></div>
      <div class="aerion-radar"><div class="radar-ring ring-one" /><div class="radar-ring ring-two" /><div class="radar-ring ring-three" /><div class="radar-axis horizontal" /><div class="radar-axis vertical" /><div class="radar-sweep" /><Plane class="radar-plane" :size="27" :stroke-width="1.6" /><span class="radar-point point-one" /><span class="radar-point point-two" /><span class="radar-point point-three" /><span class="radar-label">LIVE FLIGHT NETWORK</span></div>
      <div class="aerion-system"><div class="aerion-system-heading">FLIGHT SIMULATION INFRASTRUCTURE <span>01—05</span></div><div class="aerion-service"><span>01</span><b>Multiplayer Server</b><small>sessions / flight data / API</small></div><div class="aerion-service"><span>02</span><b>Voice Communication</b><small>frequency / realtime voice</small></div><div class="aerion-service"><span>03</span><b>Client Software</b><small>pilot workspace / connection</small></div><div class="aerion-service"><span>04</span><b>Community Platform</b><small>members / operations / monitoring</small></div><div class="aerion-service future"><span>05</span><b>Multi-tenant SaaS</b><small>future direction</small></div></div>
      <div class="aerion-bottom"><span>SERVER + VOICE + CLIENT + WEB</span><span>BUILT FOR VIRTUAL AVIATION</span></div>
    </div>
    <div v-else-if="variant === 'system'" class="ui-window system-window">
      <div class="ui-window-top"><span class="window-dots"><i /><i /><i /></span><span>openatom.system / overview</span><span>⌘ K</span></div>
      <div class="system-layout">
        <div class="system-sidebar"><strong>▦</strong><span class="active-line" /><span /><span /><span /><span class="sidebar-bottom" /></div>
        <div class="system-main">
          <div class="system-heading"><div><small>DASHBOARD / 01</small><b>社团概览</b></div><span class="tiny-pill">● SYSTEM ONLINE</span></div>
          <div class="system-metrics"><div><small>成员管理</small><b>MEMBERS</b><span class="metric-bars"><i /><i /><i /><i /><i /></span></div><div><small>活动与报名</small><b>ACTIVITIES</b><span class="metric-bars secondary"><i /><i /><i /><i /><i /></span></div><div><small>权限与数据</small><b>OPERATIONS</b><span class="metric-bars tertiary"><i /><i /><i /><i /><i /></span></div></div>
          <div class="system-bottom"><div class="chart-panel"><small>ACTIVITY FLOW</small><div class="chart-line"><span /><span /><span /><span /><span /><span /><span /></div></div><div class="list-panel"><small>RECENT MODULES</small><span>活动管理 <i>↗</i></span><span>表单系统 <i>↗</i></span><span>权限管理 <i>↗</i></span></div></div>
        </div>
      </div>
    </div>

    <div v-else-if="variant === 'publish'" class="publish-scene">
      <div class="publish-node source-node"><small>01 / SOURCE</small><b>github.com / project</b><span>main <i>✓</i></span></div>
      <div class="publish-line"><span /><span /><span /></div>
      <div class="publish-node build-node"><small>02 / BUILD</small><b>Build pipeline</b><span><i>✓</i> Dependencies</span><span><i>✓</i> Production build</span><span><i>✓</i> Deploy</span></div>
      <div class="publish-line"><span /><span /><span /></div>
      <div class="publish-node live-node"><small>03 / LIVE</small><b>your-site.dev</b><span>● Ready to visit</span></div>
    </div>

    <div v-else-if="variant === 'vision'" class="vision-scene">
      <div class="vision-grid" />
      <div class="vision-cross vision-cross-one">+</div><div class="vision-cross vision-cross-two">+</div>
      <div class="vision-object"><div class="vision-head" /><div class="vision-body" /></div>
      <div class="vision-box"><span class="vision-label">PERSON&nbsp; 0.96</span><i class="corner tl" /><i class="corner tr" /><i class="corner bl" /><i class="corner br" /></div>
      <div class="vision-hud top">CAM 01 <span>● LIVE INFERENCE</span></div>
      <div class="vision-hud bottom">YOLO / ONNX <span>FRAME 0274</span></div>
    </div>

    <div v-else class="knowledge-scene">
      <div class="knowledge-sidebar"><b>KNOWLEDGE<span>.</span></b><small>WORKSPACE</small><span class="selected">◫ &nbsp; All documents</span><span>⌕ &nbsp; Search</span><span>◇ &nbsp; Collections</span><div class="knowledge-line" /><small>RECENT</small><span>▤ &nbsp; Project notes</span><span>▤ &nbsp; Research papers</span></div>
      <div class="knowledge-main"><small>YOUR SECOND BRAIN</small><b>从资料中找到答案。</b><div class="knowledge-search">⌕ <span>Search across your knowledge...</span><i>⌘ K</i></div><div class="knowledge-result"><small>RETRIEVAL / 01</small><strong>Architecture notes</strong><span>相似内容已找到 · 文档与知识片段关联</span></div><div class="knowledge-result muted"><small>RETRIEVAL / 02</small><strong>AI model deployment</strong><span>训练、导出与端侧推理</span></div></div>
    </div>
  </div>
</template>
