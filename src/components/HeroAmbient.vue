<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{ progress: number; paused: boolean }>()
const emit = defineEmits<{ ready: [ready: boolean] }>()
const container = ref<HTMLElement | null>(null)
const ready = ref(false)
let disposed = false
let dispose: (() => void) | undefined

onMounted(async () => {
  const node = container.value
  if (!node) return
  try {
    const [THREE, { RoomEnvironment }] = await Promise.all([
      import('three'), import('three/examples/jsm/environments/RoomEnvironment.js'),
    ])
    if (disposed) return
    const smallScreen = () => matchMedia('(max-width: 899px)').matches
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(devicePixelRatio, smallScreen() ? 1.25 : 1.75))
    renderer.setClearColor(0x080b10, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.domElement.setAttribute('aria-hidden', 'true')
    node.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60)
    camera.position.set(0, 0, 10)
    const pmrem = new THREE.PMREMGenerator(renderer)
    const studio = new RoomEnvironment()
    studio.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial && object.material.side === THREE.BackSide) {
        object.material.color.set(0x15171c)
      }
    })
    const environment = pmrem.fromScene(studio, 0.04)
    scene.environment = environment.texture
    scene.environmentIntensity = 1.05
    studio.dispose()
    pmrem.dispose()
    const sculpture = new THREE.Group()
    scene.add(sculpture)
    const chromeGeometry = new THREE.TorusKnotGeometry(1.3, 0.42, smallScreen() ? 144 : 240, 32, 2, 3)
    const chromeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xb6bfcd, metalness: 1, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.25 })
    const chrome = new THREE.Mesh(chromeGeometry, chromeMaterial)
    chrome.scale.set(1, 1, 0.9)
    sculpture.add(chrome)
    const glassGeometry = new THREE.TorusGeometry(2.15, 0.19, 20, 160)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xaac5eb, metalness: 0, roughness: 0.06, transmission: 0.94, thickness: 0.7, ior: 1.45,
      clearcoat: 1, envMapIntensity: 1.8, attenuationColor: new THREE.Color(0x799ecf), attenuationDistance: 2,
    })
    const glass = new THREE.Mesh(glassGeometry, glassMaterial)
    glass.rotation.set(0.85, -0.45, 0.3)
    sculpture.add(glass)
    const accentGeometry = new THREE.TorusGeometry(2.15, 0.016, 8, 160, Math.PI * 0.55)
    const accentMaterial = new THREE.MeshStandardMaterial({ color: 0xcedfff, metalness: 0.7, roughness: 0.2, emissive: 0x355475, emissiveIntensity: 0.18 })
    const accent = new THREE.Mesh(accentGeometry, accentMaterial)
    accent.rotation.copy(glass.rotation)
    sculpture.add(accent)
    const keyLight = new THREE.DirectionalLight(0xf2f6ff, 3)
    keyLight.position.set(-3, 5, 5)
    const rimLight = new THREE.DirectionalLight(0x80adf4, 4)
    rimLight.position.set(4, -1, -3)
    const fillLight = new THREE.DirectionalLight(0xffffff, 1)
    fillLight.position.set(3, 2, 4)
    scene.add(keyLight, rimLight, fillLight)

    let visibleWidth = 10
    let mobile = smallScreen()
    let frame = 0
    let visible = true
    let elapsed = 0
    let lastTime = 0
    let lastRender = 0
    const pointer = { x: 0, y: 0 }
    const smoothedPointer = { x: 0, y: 0 }
    let pointerBounds = node.getBoundingClientRect()
    const render = () => {
      const p = motion.matches ? 0 : props.progress
      camera.position.z = mobile ? 10 : 10 - Math.sin(p * Math.PI) * 2.6
      const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
      visibleWidth = viewHeight * camera.aspect
      const scale = mobile ? Math.min(0.82, visibleWidth / 5.5) : 0.87 + p * 0.04
      sculpture.scale.setScalar(scale)
      const move = THREE.MathUtils.smoothstep(p, 0.2, 0.72)
      sculpture.position.set(mobile ? 0 : visibleWidth * 0.245 * move, mobile ? -viewHeight * 0.025 + p * 0.25 : -0.28 + p * 0.33, 0)
      sculpture.rotation.set(-0.24 + p * 0.6 + smoothedPointer.y * 0.08, -0.35 + p * (mobile ? 0.55 : Math.PI * 1.8) + elapsed * 0.035 + smoothedPointer.x * 0.12, -0.18 + p * 0.6)
      const separation = mobile ? 0 : THREE.MathUtils.smoothstep(p, 0.58, 0.95)
      glass.position.set(separation * 0.7, separation * 0.48, separation * 0.25)
      chrome.position.x = -separation * 0.14
      glass.rotation.z = 0.3 - p * 0.3
      accent.rotation.copy(glass.rotation)
      accent.position.copy(glass.position)
      renderer.render(scene, camera)
    }
    const resize = () => {
      if (disposed) return
      const width = node.clientWidth
      const height = node.clientHeight
      if (!width || !height) return
      mobile = smallScreen()
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.75))
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      visibleWidth = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect
      renderer.setSize(width, height, false)
      pointerBounds = node.getBoundingClientRect()
      render()
    }
    const animate = (time: number) => {
      frame = 0
      if (disposed || !visible || document.hidden || motion.matches) return
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0
      lastTime = time
      if (!props.paused) elapsed += delta
      if (time - lastRender >= (mobile ? 1000 / 30 : 1000 / 60)) {
        smoothedPointer.x += (pointer.x - smoothedPointer.x) * 0.06
        smoothedPointer.y += (pointer.y - smoothedPointer.y) * 0.06
        render()
        lastRender = time
      }
      frame = requestAnimationFrame(animate)
    }
    const syncAnimation = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      lastTime = 0
      if (!disposed && visible && !document.hidden) {
        render()
        if (!motion.matches) frame = requestAnimationFrame(animate)
      }
    }
    const movePointer = (event: PointerEvent) => {
      if (mobile || motion.matches || event.pointerType === 'touch') return
      pointer.x = (event.clientX - pointerBounds.left) / pointerBounds.width - 0.5
      pointer.y = (event.clientY - pointerBounds.top) / pointerBounds.height - 0.5
    }
    const resetPointer = () => { pointer.x = 0; pointer.y = 0 }
    const stage = node.parentElement
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncAnimation() }, { threshold: 0 })
    observer.observe(node)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(node)
    document.addEventListener('visibilitychange', syncAnimation)
    motion.addEventListener('change', syncAnimation)
    stage?.addEventListener('pointermove', movePointer, { passive: true })
    stage?.addEventListener('pointerleave', resetPointer)
    const contextLost = (event: Event) => { event.preventDefault(); ready.value = false; emit('ready', false); visible = false; syncAnimation() }
    const contextRestored = () => { visible = true; resize(); syncAnimation(); ready.value = true; emit('ready', true) }
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    renderer.domElement.addEventListener('webglcontextrestored', contextRestored)

    dispose = () => {
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', syncAnimation)
      motion.removeEventListener('change', syncAnimation)
      stage?.removeEventListener('pointermove', movePointer)
      stage?.removeEventListener('pointerleave', resetPointer)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      renderer.domElement.removeEventListener('webglcontextrestored', contextRestored)
      chromeGeometry.dispose(); chromeMaterial.dispose()
      glassGeometry.dispose(); glassMaterial.dispose()
      accentGeometry.dispose(); accentMaterial.dispose()
      environment.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
    resize()
    ready.value = true
    emit('ready', true)
    syncAnimation()
  } catch {
    dispose?.()
    ready.value = false
    emit('ready', false)
  }
})

onUnmounted(() => { disposed = true; dispose?.() })
</script>

<template>
  <div ref="container" class="sculpture-scene" :class="{ 'is-ready': ready }" :style="{ '--fallback-progress': progress }" aria-hidden="true">
    <svg class="sculpture-fallback" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="sculpture-chrome" x1="100" y1="90" x2="370" y2="405" gradientUnits="userSpaceOnUse"><stop stop-color="#566578" /><stop offset=".2" stop-color="#e9edf4" /><stop offset=".33" stop-color="#586579" /><stop offset=".48" stop-color="#c2d0e5" /><stop offset=".64" stop-color="#374658" /><stop offset=".82" stop-color="#d7e1ee" /><stop offset="1" stop-color="#637c9f" /></linearGradient><linearGradient id="sculpture-glass" x1="100" y1="160" x2="395" y2="390" gradientUnits="userSpaceOnUse"><stop stop-color="#d5e6ff" stop-opacity=".85" /><stop offset=".5" stop-color="#6b9fd9" stop-opacity=".15" /><stop offset="1" stop-color="#91b9ed" stop-opacity=".75" /></linearGradient></defs>
      <ellipse cx="250" cy="260" rx="215" ry="110" transform="rotate(-32 250 260)" stroke="url(#sculpture-glass)" stroke-width="8" />
      <path d="M253 105C153 51 81 120 121 211C156 290 322 350 356 272C391 192 299 107 216 187C151 250 158 405 258 378C357 351 345 155 253 105Z" stroke="#090e17" stroke-width="57" />
      <path d="M253 105C153 51 81 120 121 211C156 290 322 350 356 272C391 192 299 107 216 187C151 250 158 405 258 378C357 351 345 155 253 105Z" stroke="url(#sculpture-chrome)" stroke-width="50" stroke-linecap="round" />
      <path d="M121 211C156 290 322 350 356 272" stroke="url(#sculpture-chrome)" stroke-width="50" stroke-linecap="round" />
    </svg>
  </div>
</template>

<style scoped>
.sculpture-scene { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.sculpture-scene :deep(canvas) { position: absolute; inset: 0; display: block; width: 100%; height: 100%; opacity: 0; transition: opacity .6s; }
.sculpture-scene.is-ready :deep(canvas) { opacity: 1; }
.sculpture-fallback { position: absolute; width: min(47vw, 650px); height: auto; right: 50%; top: 53%; transform: translate(calc(50% + var(--fallback-progress, 0) * 24vw), -50%) rotate(calc(var(--fallback-progress, 0) * 120deg)); opacity: .85; transition: opacity .6s; }
.is-ready .sculpture-fallback { opacity: 0; }
@media (max-width: 899px) { .sculpture-fallback { width: min(85%, 400px); right: 50%; top: 51%; transform: translate(50%, -50%); } }
@media (prefers-reduced-motion: reduce) { .sculpture-scene :deep(canvas), .sculpture-fallback { transition: none; } }
</style>
