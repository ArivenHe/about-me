<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Github, Mail } from 'lucide-vue-next'
import SculpturalHero from '@/components/SculpturalHero.vue'
import ProjectShowcase from '@/components/ProjectShowcase.vue'
import FlightScene from '@/components/FlightScene.vue'
import LiquidSurface from '@/components/LiquidSurface.vue'
import { profile, projects, publicRepositories, stack } from '@/data/site'

const page = ref<HTMLElement | null>(null)
const flightPaused = ref(false)
const projectTrack = ref<HTMLElement | null>(null)
const activeProject = ref(0)
let navigateGallery: ((index: number) => void) | undefined
let cancelGalleryNavigation: (() => void) | undefined
let galleryNavigating = false
let galleryRange: { start: number; end: number } | null = null
function selectProject(index: number) {
  const target = Math.max(0, Math.min(projects.length - 1, index))
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (galleryRange && navigateGallery) {
    navigateGallery(target)
  } else if (galleryRange) {
    window.scrollTo({ top: galleryRange.start + (galleryRange.end - galleryRange.start) * target / (projects.length - 1), behavior: reduce ? 'instant' : 'smooth' })
  } else if (projectTrack.value) {
    projectTrack.value.scrollTo({ left: projectTrack.value.clientWidth * target, behavior: reduce ? 'instant' : 'smooth' })
  }
}
function syncProjectScroll() {
  if (!galleryRange && projectTrack.value) activeProject.value = Math.round(projectTrack.value.scrollLeft / projectTrack.value.clientWidth)
}
const currentYear = new Date().getFullYear()
const journey = [
  { title: '为 Web 构建。', english: 'Build for the Web', description: '从 Vue 页面和交互开始，把设计与代码变成真实可用的 Web 产品。', tags: 'Interface · Interaction · Experience' },
  { title: '以系统思考。', english: 'Think in Systems', description: '进入 Java 服务端、数据模型与部署流程，理解完整系统如何协同。', tags: 'Architecture · Data · Infrastructure' },
  { title: '向新的边界探索。', english: 'Explore New Frontiers', description: '把 AI、计算机视觉和 OpenHarmony 纳入实践，持续学习新的工程边界。', tags: 'AI · Computer Vision · OpenHarmony' },
]
let disposed = false
let cleanup: (() => void) | undefined

onMounted(async () => {
  try {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
    if (disposed || !page.value) return
    const root = page.value
    gsap.registerPlugin(ScrollTrigger)
    const media = gsap.matchMedia()
    cleanup = () => media.revert()
    media.add({ desktop: '(min-width: 900px)', reduce: '(prefers-reduced-motion: reduce)' }, (context) => {
      const enhanced = Boolean(context.conditions?.desktop && !context.conditions?.reduce)
      root.classList.toggle('has-scroll-scenes', enhanced)
      galleryRange = null
      activeProject.value = 0
      if (context.conditions?.reduce) return () => root.classList.remove('has-scroll-scenes')
      const scope = gsap.context(() => {
        gsap.fromTo('.page-progress i', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } })
        gsap.utils.toArray<HTMLElement>('.apple-chapter').forEach((chapter) => {
          const scene = chapter.dataset.scene
          if (scene === 'gallery') {
            const track = chapter.querySelector<HTMLElement>('.projects-track')
            if (enhanced && track) {
              let navigationTween: ReturnType<typeof gsap.to> | undefined
              cancelGalleryNavigation = () => { navigationTween?.kill(); galleryNavigating = false }
              navigateGallery = (index) => {
                if (!galleryRange) return
                navigationTween?.kill()
                galleryNavigating = true
                activeProject.value = index
                const cursor = { y: window.scrollY }
                navigationTween = gsap.to(cursor, { y: galleryRange.start + (galleryRange.end-galleryRange.start)*index/(projects.length-1), duration: .7, ease: 'power2.inOut', onUpdate: () => window.scrollTo({top: cursor.y, behavior: 'instant'}), onComplete: () => { galleryNavigating = false } })
              }
              gsap.to(track, { x: () => -(track.scrollWidth - chapter.clientWidth), ease: 'none', scrollTrigger: {
                trigger: chapter, start: 'top top', end: 'bottom bottom', scrub: 0.35, invalidateOnRefresh: true,
                onRefresh: (trigger) => { galleryRange = { start: trigger.start, end: trigger.end } },
                onUpdate: (trigger) => { if (!galleryNavigating) activeProject.value = Math.round(trigger.progress * (projects.length - 1)) },
              } })
            }
            return
          }
          const heading = chapter.querySelector('.scene-heading')
          const visual = chapter.querySelector('.scene-visual')
          if (!enhanced) {
            if (heading) gsap.from(heading, { y: 36, opacity: 0, duration: 0.75, clearProps: 'opacity,transform', scrollTrigger: { trigger: chapter, start: 'top 85%', once: true } })
            if (visual) gsap.fromTo(visual, { y: 30, scale: 0.95 }, { y: -18, scale: 1, ease: 'none', scrollTrigger: { trigger: chapter, start: 'top bottom', end: 'bottom top', scrub: 0.5 } })
            return
          }
          const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: chapter, start: 'top top', end: 'bottom bottom', scrub: 0.75, invalidateOnRefresh: true } })
          if (heading) {
            timeline.fromTo(heading, { y: 65, scale: 1.12, opacity: 0.35 }, { y: 0, scale: 1, opacity: 1, duration: 0.3 }, 0)
            timeline.to(heading, { y: -22, duration: 0.25 }, 0.75)
          }
          const caption = chapter.querySelector('.scene-caption')
          if (caption) timeline.fromTo(caption, { y: 45, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, 0.35)
          if (scene === 'about') {
            timeline.fromTo(chapter.querySelectorAll('.reading-statement span'), { color: '#b9b9be' }, { color: '#1d1d1f', stagger: 0.08, duration: 0.2 }, 0.08)
            timeline.fromTo('.about-portrait', { scale: 0.85, rotation: -8 }, { scale: 1, rotation: 0, duration: 0.8 }, 0)
          } else if (scene === 'stack' || scene === 'journey') {
            const cards = chapter.querySelectorAll<HTMLElement>('.deck-card')
            cards.forEach((card, index) => {
              const start = index === 0 ? 0 : 0.12 + index * (0.7 / cards.length)
              if (index === 0) timeline.fromTo(card, { y: 60, scale: 0.9, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.14 }, 0)
              else {
                gsap.set(card, { autoAlpha: 0, y: 110, scale: 0.88, rotationX: 9 })
                timeline.to(cards[index - 1], { y: -90, scale: 1.06, autoAlpha: 0, duration: 0.13 }, start)
                timeline.to(card, { y: 0, scale: 1, rotationX: 0, autoAlpha: 1, duration: 0.16 }, start + 0.03)
              }
            })
            timeline.to({}, { duration: 0.1 }, 0.9)
          } else if (scene === 'project') {
            timeline.fromTo(visual, { scale: 0.68, y: 100, rotationX: 18, rotationY: -10 }, { scale: 1, y: 0, rotationX: 0, rotationY: 0, duration: 0.65 }, 0)
            timeline.to(visual, { scale: 1.035, y: -12, duration: 0.35 }, 0.65)
          } else if (scene === 'community') {
            timeline.fromTo(visual, { scale: 0.65, y: 50 }, { scale: 1, y: 0, duration: 0.75 }, 0)
            timeline.fromTo(chapter.querySelectorAll('.network-line'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.04, duration: 0.3 }, 0.15)
            timeline.fromTo(chapter.querySelectorAll('.network-node'), { opacity: 0.15 }, { opacity: 1, stagger: 0.04, duration: 0.25 }, 0.3)
          } else if (scene === 'github') {
            timeline.fromTo(visual, { scale: 0.7, rotationX: 24, y: 80 }, { scale: 1, rotationX: 0, y: 0, duration: 0.75 }, 0)
          } else if (scene === 'contact') {
            timeline.fromTo(chapter.querySelector('.contact-actions'), { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.25)
          }
          const backdrop = chapter.querySelector('.scene-backdrop')
          if (backdrop) timeline.fromTo(backdrop, { yPercent: 15, scale: 1.15 }, { yPercent: -15, scale: 1, duration: 1 }, 0)
          timeline.to({}, { duration: 0.01 }, 0.99)
        })
        gsap.from('.footer-inner', { y: 30, opacity: 0, duration: 0.65, clearProps: 'opacity,transform', scrollTrigger: { trigger: '.site-footer', start: 'top 95%', once: true } })
      }, root)
      void document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh() })
      ScrollTrigger.refresh()
      return () => { cancelGalleryNavigation?.(); cancelGalleryNavigation = undefined; scope.revert(); navigateGallery = undefined; galleryNavigating = false; galleryRange = null; root.classList.remove('has-scroll-scenes') }
    })
  } catch {
    page.value?.classList.remove('has-scroll-scenes')
  }
})

onUnmounted(() => { disposed = true; cleanup?.() })
</script>

<template>
  <div ref="page" class="apple-page" id="top">
    <a class="skip-link" href="#main">跳转到主要内容</a>
    <div class="page-progress" aria-hidden="true"><i /></div>
    <FlightScene :paused="flightPaused" />
    <main id="main">
      <SculpturalHero />

      <section id="about" class="apple-chapter scene-paper scene-about" data-scene="about" aria-labelledby="about-title">
        <div class="chapter-stage"><div class="shell scene-content">
          <p class="chapter-label">01 / ABOUT ME</p>
          <h2 id="about-title" class="scene-heading">保持好奇。<br /><span>持续构建。</span></h2>
          <p class="reading-statement"><span>从一行代码，</span><span>到一个完整的系统。</span><br /><span>从 Web，</span><span>到 AI 与 OpenHarmony。</span><br /><span>每一次探索，</span><span>都向真实的世界更进一步。</span></p>
          <div class="scene-caption about-bio"><img class="about-portrait" src="/ariven-avatar.jpg" alt="Ariven 的头像" width="64" height="64" /><p>我是 Ariven / 何治皓，一名学生开发者。<br />把学习变成项目，把想法变成可以使用的东西。</p></div>
        </div></div>
      </section>

      <section id="stack" class="apple-chapter scene-stack" data-scene="stack" aria-labelledby="stack-title">
        <div class="chapter-stage"><div class="scene-backdrop stack-aura" aria-hidden="true" /><div class="shell scene-content">
          <p class="chapter-label">02 / CAPABILITIES</p>
          <h2 id="stack-title" class="scene-heading">为体验而写。<br /><span>为系统而想。</span></h2>
          <div class="capability-deck scene-visual">
            <article v-for="group in stack" :key="group.label" class="deck-card capability-card"><span class="capability-number" aria-hidden="true">{{ group.index }}</span><p class="capability-category">{{ group.index }} / THE TOOLBOX</p><h3>{{ group.label }}</h3><p class="capability-description">{{ group.description }}</p><div class="capability-tags"><span v-for="item in group.items" :key="item">{{ item }}</span></div></article>
          </div>
          <p class="deck-note">不同的工具。同一个目标：把事情做好。</p>
        </div></div>
      </section>

      <section id="projects" aria-labelledby="projects-title">
        <div class="apple-chapter scene-work" data-scene="work">
          <div class="chapter-stage"><div class="scene-backdrop work-orb" aria-hidden="true" /><div class="shell scene-content">
            <p class="chapter-label">03 / SELECTED WORK</p><h2 id="projects-title" class="scene-heading work-title">想法。<br /><span>真的会发生。</span></h2><p class="scene-caption work-caption">从模拟飞行基础设施，到校园开源平台。<br />每一个项目，都在真实的问题中成长。</p><a class="scene-down" href="#project-gallery" aria-label="进入横向项目展廊"><ArrowDown :size="22" /></a>
          </div></div>
        </div>
        <div id="project-gallery" class="apple-chapter project-gallery" data-scene="gallery" aria-label="精选项目横向展廊">
          <div class="chapter-stage gallery-stage">
            <div ref="projectTrack" class="projects-track" @scroll.passive="syncProjectScroll">
              <ProjectShowcase v-for="(project, index) in projects" :key="project.id" :project="project" :index="index" gallery />
            </div>
            <LiquidSurface class="gallery-dock" :radius="99" :strength="48">
            <nav class="gallery-controls" aria-label="切换项目" @keydown.left.prevent="selectProject(activeProject - 1)" @keydown.right.prevent="selectProject(activeProject + 1)">
              <span class="gallery-counter"><b>{{ String(activeProject + 1).padStart(2, '0') }}</b><span> / {{ String(projects.length).padStart(2, '0') }}</span></span>
              <div class="gallery-dots"><button v-for="(project, index) in projects" :key="project.id" :aria-label="`查看 ${project.name}`" :aria-current="activeProject === index ? 'true' : undefined" @click="selectProject(index)"><i /></button></div>
              <div class="gallery-arrows"><button aria-label="上一个项目" :disabled="activeProject === 0" @click="selectProject(activeProject - 1)"><ChevronLeft :size="18" /></button><button aria-label="下一个项目" :disabled="activeProject === projects.length - 1" @click="selectProject(activeProject + 1)"><ChevronRight :size="18" /></button></div>
            </nav>
            </LiquidSurface>
          </div>
        </div>
      </section>

      <section id="open-source" class="apple-chapter scene-community" data-scene="community" aria-labelledby="community-title">
        <div class="chapter-stage"><div class="scene-backdrop community-aura" aria-hidden="true" /><div class="shell scene-content">
          <p class="chapter-label">04 / OPEN SOURCE</p><h2 id="community-title" class="scene-heading">开源。<br /><span>让构建不止于我。</span></h2>
          <div class="community-network scene-visual" aria-hidden="true">
            <svg viewBox="0 0 860 290" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g stroke="#567aab" stroke-width="1.4"><path class="network-line" pathLength="1" d="M430 145L175 55" /><path class="network-line" pathLength="1" d="M430 145L685 55" /><path class="network-line" pathLength="1" d="M430 145L175 235" /><path class="network-line" pathLength="1" d="M430 145L685 235" /><path class="network-line" pathLength="1" d="M430 145L80 145" /><path class="network-line" pathLength="1" d="M430 145L780 145" /></g>
              <g class="network-node"><rect x="317" y="100" width="226" height="90" rx="24" fill="#e8f0fb" /><text x="430" y="138" text-anchor="middle" fill="#142131" font-size="19" font-weight="700">JMI-OPENATOM</text><text x="430" y="162" text-anchor="middle" fill="#546579" font-size="11">OPEN · BUILD · SHARE</text></g>
              <g v-for="node in [{x:175,y:55,text:'Developers'}, {x:685,y:55,text:'Ideas'}, {x:175,y:235,text:'Projects'}, {x:685,y:235,text:'Community'}, {x:80,y:145,text:'Learn'}, {x:780,y:145,text:'Share'}]" :key="node.text" class="network-node"><rect :x="node.x - 62" :y="node.y - 22" width="124" height="44" rx="22" fill="#111e30" stroke="#436184" /><text :x="node.x" :y="node.y + 5" text-anchor="middle" fill="#c9ddf7" font-size="13">{{ node.text }}</text></g>
            </svg>
          </div>
          <div class="scene-caption community-caption"><p>作为江苏海事职业技术学院开放原子开源社团负责人，<br />与同伴一起学习、分享，让更多想法有机会落地。</p><div class="inline-links"><a :href="profile.organizationUrl" target="_blank" rel="noopener noreferrer">探索开源组织 <ArrowUpRight :size="16" /></a><a :href="profile.communityUrl" target="_blank" rel="noopener noreferrer">走进社团 <ArrowUpRight :size="16" /></a></div></div>
        </div></div>
      </section>

      <section id="journey" class="apple-chapter scene-paper scene-journey" data-scene="journey" aria-labelledby="journey-title">
        <div class="chapter-stage"><div class="shell scene-content">
          <p class="chapter-label">05 / A CONTINUOUS JOURNEY</p><h2 id="journey-title" class="scene-heading">下一步。<br /><span>还有更多可能。</span></h2>
          <div class="journey-deck scene-visual"><article v-for="(step, index) in journey" :key="step.title" class="deck-card journey-card"><span class="journey-number" aria-hidden="true">0{{ index + 1 }}</span><p class="journey-english">{{ step.english }}</p><h3>{{ step.title }}</h3><p class="journey-description">{{ step.description }}</p><p class="journey-tags">{{ step.tags }}</p></article></div>
        </div></div>
      </section>

      <section id="github" class="apple-chapter scene-github" data-scene="github" aria-labelledby="github-title">
        <div class="chapter-stage"><div class="scene-backdrop github-aura" aria-hidden="true" /><div class="shell scene-content">
          <p class="chapter-label">06 / CODE IN THE OPEN</p><h2 id="github-title" class="scene-heading">代码公开。<br /><span>探索继续。</span></h2>
          <div class="repo-terminal scene-visual"><div class="terminal-top"><span class="window-dots"><i /><i /><i /></span><span>ariven / open-source</span><Github :size="17" /></div><p class="terminal-command"><span>~/</span> building in public</p><a v-for="repo in publicRepositories" :key="repo.name" :href="repo.url" target="_blank" rel="noopener noreferrer" class="repo-row"><span class="repo-symbol">↳</span><span><strong>{{ repo.name }}</strong><small>{{ repo.detail }}</small></span><ArrowUpRight :size="17" /></a><a class="repo-all" :href="profile.organizationUrl" target="_blank" rel="noopener noreferrer">查看全部公开仓库 <ArrowUpRight :size="15" /></a></div>
          <div class="scene-caption inline-links"><a :href="profile.personalGithub" target="_blank" rel="noopener noreferrer">@ArivenHe <ArrowUpRight :size="16" /></a><a :href="profile.organizationUrl" target="_blank" rel="noopener noreferrer">@jmi-openatom <ArrowUpRight :size="16" /></a></div>
        </div></div>
      </section>

      <section id="contact" class="apple-chapter scene-paper scene-contact" data-scene="contact" aria-labelledby="contact-title">
        <div class="chapter-stage"><div class="shell scene-content">
          <p class="chapter-label">07 / LET’S BUILD SOMETHING</p><h2 id="contact-title" class="scene-heading contact-title">有想法。<br /><span>就一起实现。</span></h2><p class="contact-note">关于项目、开源协作，或者新的技术问题。</p><div class="contact-actions"><a class="apple-button" :href="`mailto:${profile.email}`"><Mail :size="19" /> 联系我 <ArrowUpRight :size="17" /></a><a class="contact-github" :href="profile.personalGithub" target="_blank" rel="noopener noreferrer"><Github :size="19" /> GitHub <ArrowUpRight :size="16" /></a></div><a class="contact-email" :href="`mailto:${profile.email}`">{{ profile.email }}</a>
        </div></div>
      </section>
    </main>
    <footer class="site-footer"><div class="shell footer-inner"><a class="footer-brand" href="#top"><img src="/ariven-avatar.jpg" alt="" width="30" height="30" /> Ariven.</a><span>© 2025–{{ currentYear }} Ariven / 何治皓</span><button class="flight-pause" :aria-pressed="flightPaused" @click="flightPaused = !flightPaused">{{ flightPaused ? '恢复飞机浮动' : '暂停飞机浮动' }}</button><a class="model-credit" href="/models/credits.html" target="_blank" rel="noopener noreferrer">3D Credits ↗</a><a href="#top" class="back-top" aria-label="返回顶部">返回顶部 ↑</a></div></footer>
  </div>
</template>
