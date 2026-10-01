<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-vue-next'
import LiquidSurface from './LiquidSurface.vue'
import { profile } from '@/data/site'

const menuOpen = ref(false)
const theme = ref<'dark' | 'light'>('dark')
const navigation = [
  { label: 'About', href: '#about' },
  { label: 'Stack', href: '#stack' },
  { label: 'Projects', href: '#projects' },
  { label: 'Open Source', href: '#open-source' },
]

onMounted(() => {
  const saved = localStorage.getItem('ariven-theme')
  if (saved === 'light' || saved === 'dark') theme.value = saved
  document.documentElement.dataset.theme = theme.value
})

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  localStorage.setItem('ariven-theme', theme.value)
}

function closeMenu() { menuOpen.value = false }
</script>

<template>
  <header class="site-header">
    <LiquidSurface class="shell header-glass" :radius="36" :strength="42">
    <div class="header-inner">
      <a class="brand" href="#top" aria-label="Ariven，返回页面顶部" @click="closeMenu">
        <img class="brand-mark" src="/ariven-avatar.jpg" alt="" width="40" height="40" />
        <span class="brand-name">ARIVEN <span>/ 何治皓</span></span>
      </a>

      <nav class="desktop-nav" aria-label="主导航">
        <a v-for="item in navigation" :key="item.href" :href="item.href">{{ item.label }}</a>
      </nav>

      <div class="header-actions">
        <button class="icon-button theme-button" type="button" :aria-label="theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'" @click="toggleTheme">
          <Sun v-if="theme === 'dark'" :size="18" :stroke-width="1.8" />
          <Moon v-else :size="18" :stroke-width="1.8" />
        </button>
        <a class="header-github" :href="profile.personalGithub" target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight :size="15" /></a>
        <button class="icon-button menu-button" type="button" :aria-expanded="menuOpen" aria-controls="mobile-navigation" :aria-label="menuOpen ? '关闭菜单' : '打开菜单'" @click="menuOpen = !menuOpen">
          <X v-if="menuOpen" :size="21" />
          <Menu v-else :size="21" />
        </button>
      </div>
    </div>
    <nav v-if="menuOpen" id="mobile-navigation" class="mobile-nav" aria-label="移动端导航">
      <a v-for="item in navigation" :key="item.href" :href="item.href" @click="closeMenu">{{ item.label }}</a>
      <a :href="profile.personalGithub" target="_blank" rel="noopener noreferrer" @click="closeMenu">GitHub ↗</a>
    </nav>
    </LiquidSurface>
  </header>
</template>
