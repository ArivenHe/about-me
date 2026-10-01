<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
const experience = ref<HTMLElement | null>(null)
const letters = 'Ariven'.split('')
let disposed = false
let cleanup: (() => void) | undefined
onMounted(async () => {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
  if (disposed || !experience.value) return
  gsap.registerPlugin(ScrollTrigger)
  const media = gsap.matchMedia()
  cleanup = () => media.revert()
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const scope = gsap.context(() => {
      const intro = gsap.timeline()
      intro.from('.name-letter', { yPercent: 110, rotationX: -45, opacity: 0, duration: 1.15, stagger: 0.07, ease: 'power3.out', clearProps: 'all' })
      intro.from('.hero-chinese-name', { y: 18, opacity: 0, duration: 1, ease: 'power2.out', clearProps: 'all' }, .55)
      intro.from('.hero-intro-copy', { y: 18, opacity: 0, duration: .9, stagger: .12, ease: 'power2.out', clearProps: 'all' }, .75)
      gsap.to('.hero-name-group', { y: -75, scale: .92, opacity: 0, ease: 'none', scrollTrigger: { trigger: experience.value, start: 'top top', end: 'bottom 30%', scrub: .5 } })
      gsap.fromTo('.flight-orbit path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.8, stagger: .2, ease: 'power2.inOut', delay: .4 })
      gsap.fromTo('.name-aura', { opacity: .6 }, { opacity: 1, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    }, experience.value!)
    return () => scope.revert()
  })
})
onUnmounted(() => { disposed = true; cleanup?.() })
</script>

<template>
  <section ref="experience" class="hero-experience" aria-labelledby="hero-title">
    <div class="name-aura" aria-hidden="true" />
    <div class="hero-atmosphere" aria-hidden="true" />
    <svg class="flight-orbit" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true"><defs><linearGradient id="orbit-light" x1="100" y1="750" x2="1400" y2="280" gradientUnits="userSpaceOnUse"><stop stop-color="#7ba5d5" stop-opacity="0"/><stop offset=".5" stop-color="#7ba5d5" stop-opacity=".35"/><stop offset="1" stop-color="#779ad0" stop-opacity="0"/></linearGradient></defs><path pathLength="1" d="M-240 780C110 420 740 90 1360 190C1780 250 1370 830 700 1040" stroke="url(#orbit-light)"/><path pathLength="1" d="M-220 810C150 420 740 110 1370 205C1710 256 1340 835 740 1000" stroke="url(#orbit-light)" stroke-opacity=".35"/></svg>
    <div class="hero-name-group">
      <p class="hero-role hero-intro-copy">Developer &amp; Open Source Builder</p>
      <h1 id="hero-title" lang="en" aria-label="Ariven"><span v-for="(letter, index) in letters" :key="index" class="name-letter" aria-hidden="true">{{ letter }}</span></h1>
      <p class="hero-chinese-name">何治皓</p>
      <p class="hero-description hero-intro-copy">探索 <span>Web、AI 与 OpenHarmony。</span><br />把想法，变成真实可用的产品。</p>
    </div>
    <a class="hero-scroll-cue" href="#about" aria-label="向下探索关于我"><span>向下探索</span><i aria-hidden="true" /></a>
  </section>
</template>

<style scoped>
.hero-experience { height: 100svh; min-height: 540px; position: relative; display: grid; place-items: center; background: #000; color: #f5f5f7; overflow: hidden; }
.name-aura { position: absolute; inset: 0; background: radial-gradient(ellipse at 68% 55%, #14335c66 0%, #07101d44 38%, transparent 70%); pointer-events: none; }
.flight-orbit { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.flight-orbit path { stroke-dasharray: 1; }
.hero-atmosphere { position: absolute; inset: 0; background: radial-gradient(ellipse at 85% 65%, #0e2e562e, transparent 48%); pointer-events: none; }
.hero-name-group { width: min(calc(100% - 96px), 1200px); position: relative; z-index: 2; text-align: left; margin-top: -8svh; pointer-events: none; }
h1 { display: flex; justify-content: flex-start; gap: .012em; font-family: var(--apple-font-display); font-size: clamp(108px, 14.2vw, 204px); line-height: 1.08; font-weight: 600; letter-spacing: -.02em; text-shadow: 0 2px 20px #0009; margin: 0; perspective: 900px; }
.name-letter { display: inline-block; }
.hero-chinese-name { font-size: clamp(23px, 2vw, 28px); font-weight: 400; letter-spacing: .28em; color: #d1d9e6; margin: 24px 0 0; line-height: 1.4; }
.hero-role { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .16em; color: #8294ae; margin: 0 0 26px; line-height: 1.6; }
.hero-description { font-size: 17px; font-weight: 400; color: #8d9bb1; line-height: 1.95; letter-spacing: .015em; margin: 36px 0 0; max-width: 430px; }
.hero-description span { color: #bac8dc; }
.hero-scroll-cue { position: absolute; z-index: 2; bottom: 28px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 12px; min-height: 44px; color: #79879c; font-size: 11px; }
.hero-scroll-cue i { width: 7px; height: 7px; border-right: 1px solid #79879c; border-bottom: 1px solid #79879c; transform: rotate(45deg) translateY(-2px); }
@media(max-width:899px) { .hero-name-group { width: calc(100% - 40px); text-align: center; align-self: start; margin-top: 14svh; } h1 { justify-content: center; font-size: 23vw; } .hero-chinese-name { font-size: 22px; margin-top: 18px; } .hero-role { margin: 0 0 24px; font-size: 9px; letter-spacing: .12em; } .hero-description { font-size: 14px; margin: 28px auto 0; } }
@media(max-height:500px) { .hero-experience { min-height: 100svh; } h1 { font-size: 24svh; } .hero-chinese-name { font-size: 20px; margin-top: 12px; } }
</style>
