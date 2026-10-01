<script setup lang="ts">
import type { BufferGeometry, Material } from 'three'
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{ paused: boolean }>()
const emit = defineEmits<{ ready: [value: boolean] }>()
const container = ref<HTMLElement | null>(null)
const ready = ref(false)
let disposed = false
let cleanup: (() => void) | undefined

type Pose = { at: number; x: number; y: number; size: number; pitch: number; yaw: number; bank: number; opacity: number }

onMounted(async () => {
  if (!container.value) return
  const node: HTMLElement = container.value
  const releases: Array<() => void> = []
  cleanup = () => { releases.reverse().forEach((release) => release()); releases.length = 0 }
  try {
    const [THREE, { RoomEnvironment }, { gsap }, { ScrollTrigger }] = await Promise.all([
      import('three'), import('three/examples/jsm/environments/RoomEnvironment.js'), import('gsap'), import('gsap/ScrollTrigger'),
    ])
    if (disposed) return
    gsap.registerPlugin(ScrollTrigger)
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const smallScreen = () => matchMedia('(max-width: 899px)').matches
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    releases.push(() => { renderer.dispose(); renderer.domElement.remove() })
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.domElement.setAttribute('aria-hidden', 'true')
    node.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80)
    camera.position.set(0, 0, 12)
    const pmrem = new THREE.PMREMGenerator(renderer)
    const studio = new RoomEnvironment()
    const environment = pmrem.fromScene(studio, 0.04)
    releases.push(() => environment.dispose())
    scene.environment = environment.texture
    scene.environmentIntensity = 0.9
    studio.dispose(); pmrem.dispose()

    // A complete aircraft, built locally: fuselage, swept wings, tail, nacelles and cabin details.
    // A sparse depth field shares the aircraft renderer; no second canvas or DOM particles.
    const particleCount = smallScreen() ? 220 : 620
    const particlePositions = new Float32Array(particleCount*3)
    const particleSeeds = new Float32Array(particleCount)
    let seed = 7301
    const random = () => { seed = (seed*16807)%2147483647; return (seed-1)/2147483646 }
    for(let i=0;i<particleCount;i++) {
      particlePositions[i*3] = (random()-.5)*29
      particlePositions[i*3+1] = (random()-.5)*18
      particlePositions[i*3+2] = -2-random()*9
      particleSeeds[i] = random()
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position',new THREE.BufferAttribute(particlePositions,3))
    particleGeometry.setAttribute('aSeed',new THREE.BufferAttribute(particleSeeds,1))
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime:{value:0}, uRatio:{value:1}, uPointer:{value:new THREE.Vector2()} },
      vertexShader: `attribute float aSeed; uniform float uTime; uniform float uRatio; uniform vec2 uPointer; varying float vAlpha;
        void main(){ vec3 p=position; p.x+=sin(uTime*.08+aSeed*25.)*.08; p.y+=cos(uTime*.06+aSeed*32.)*.1;
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=(1.5+aSeed*2.2)*uRatio*(16./-mv.z);
          vAlpha=(.18+aSeed*.4)*(.7+.3*sin(uTime*.5+aSeed*40.)); }`,
      fragmentShader: `varying float vAlpha; void main(){ float d=length(gl_PointCoord-.5); if(d>.5) discard; float glow=1.-smoothstep(.06,.5,d); gl_FragColor=vec4(.61,.76,1.,glow*vAlpha); }`,
      transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    })
    const particles = new THREE.Points(particleGeometry,particleMaterial)
    scene.add(particles)
    releases.push(()=>{particleGeometry.dispose();particleMaterial.dispose()})
    const aircraft = new THREE.Group()
    scene.add(aircraft)
    const metal = new THREE.MeshPhysicalMaterial({ color: 0x9ca9b9, metalness: 0.82, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.18 })
    const wingMetal = new THREE.MeshPhysicalMaterial({ color: 0x7f8c9e, metalness: 0.88, roughness: 0.28, clearcoat: 0.8 })
    const dark = new THREE.MeshStandardMaterial({ color: 0x111c2b, metalness: 0.65, roughness: 0.22 })
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x0b2239, metalness: 0.55, roughness: 0.08, clearcoat: 1 })
    const silver = new THREE.MeshStandardMaterial({ color: 0xd1dce8, metalness: 0.95, roughness: 0.22 })
    const blue = new THREE.MeshStandardMaterial({ color: 0x8faedb, metalness: 0.7, roughness: 0.3 })
    ;[metal, wingMetal, dark, glass, silver, blue].forEach((material) => releases.push(() => material.dispose()))
    function mesh(geometry: BufferGeometry, material: Material, parent = aircraft) {
      const part = new THREE.Mesh(geometry, material)
      parent.add(part)
      releases.push(() => geometry.dispose())
      return part
    }
    const profile = [[0,-3.55],[0.06,-3.3],[0.14,-2.9],[0.26,-2.45],[0.37,-1.8],[0.41,-1.2],[0.42,1.75],[0.38,2.3],[0.28,2.75],[0.15,3.05],[0,3.22]]
    const bodyGeometry = new THREE.LatheGeometry(profile.map(([radius, z]) => new THREE.Vector2(radius, z)), 64)
    bodyGeometry.rotateX(Math.PI / 2)
    mesh(bodyGeometry, metal)
    function foil(points: number[][], depth: number, material: Material, y: number) {
      const shape = new THREE.Shape()
      shape.moveTo(points[0][0], points[0][1])
      points.slice(1).forEach(([x, z]) => shape.lineTo(x, z))
      shape.closePath()
      const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.035, bevelThickness: 0.025 })
      geometry.rotateX(Math.PI / 2)
      const part = mesh(geometry, material)
      part.position.y = y
      return part
    }
    for (const side of [-1, 1]) {
      foil([[side*.3,1.05],[side*1.4,.42],[side*3.65,-1.12],[side*3.8,-1.47],[side*3.24,-1.49],[side*.34,-.58]], .075, wingMetal, -.07)
      foil([[side*.13,-2.2],[side*1.5,-2.93],[side*1.68,-3.26],[side*1.16,-3.26],[side*.12,-2.85]], .055, metal, .14)
      // Small raised winglets and the engine pylons under each wing.
      const winglet = foil([[0,0],[.43,.16],[.62,.06],[.5,-.1]], .03, blue, 0)
      winglet.rotation.z = side * Math.PI / 2.3
      winglet.position.set(side*3.64,.12,-1.24)
      const pylon = mesh(new THREE.BoxGeometry(.075,.35,.63), wingMetal)
      pylon.position.set(side*1.3,-.28,.05)
      const engine = new THREE.Group()
      engine.position.set(side*1.3,-.55,.36)
      aircraft.add(engine)
      const nacelle = new THREE.LatheGeometry([[.23,-.7],[.31,-.48],[.34,.2],[.31,.5],[.245,.53],[.23,.4],[.21,-.45],[.16,-.7]].map(([radius,z])=>new THREE.Vector2(radius,z)), 48)
      nacelle.rotateX(Math.PI / 2)
      mesh(nacelle, metal, engine)
      const rim = mesh(new THREE.TorusGeometry(.273,.025,12,48), silver, engine)
      rim.position.z = .5
      const fan = mesh(new THREE.CylinderGeometry(.245,.245,.025,32), dark, engine)
      fan.rotation.x = Math.PI/2; fan.position.z = .37
      const hub = mesh(new THREE.ConeGeometry(.073,.16,24), silver, engine)
      hub.rotation.x = Math.PI/2; hub.position.z = .44
      for (let i=0;i<12;i++) {
        const blade = mesh(new THREE.BoxGeometry(.021,.18,.025), silver, engine)
        const angle = i/12*Math.PI*2
        blade.position.set(Math.sin(angle)*.13,Math.cos(angle)*.13,.4)
        blade.rotation.z = -angle+.4
      }
      // The cabin windows follow the curvature of the body.
      for (let i=0;i<20;i++) {
        const window = mesh(new THREE.SphereGeometry(1,8,8), glass)
        window.scale.set(.018,.065,.045)
        window.position.set(side*.392,.13,1.72-i*.172)
      }
      const cockpit = mesh(new THREE.SphereGeometry(1,16,12), glass)
      cockpit.scale.set(.018,.09,.32)
      cockpit.position.set(side*.238,.195,2.62)
      cockpit.rotation.y = side*.34
      for (const z of [1.98,-1.87]) {
        const door = mesh(new THREE.BoxGeometry(.013,.27,.125), wingMetal)
        door.position.set(side*.399,.035,z)
      }
    }
    // The vertical stabilizer is a thin extrusion standing above the tail.
    const fin = new THREE.Shape()
    fin.moveTo(-3.17,.12); fin.lineTo(-3.35,1.48); fin.lineTo(-2.94,1.48); fin.lineTo(-1.82,.12); fin.closePath()
    const finGeometry = new THREE.ExtrudeGeometry(fin, {depth:.065, bevelEnabled:true, bevelSize:.018, bevelThickness:.018, bevelSegments:2, steps:1})
    finGeometry.rotateY(-Math.PI/2)
    const tail = mesh(finGeometry, blue); tail.position.x = .032
    const light = new THREE.DirectionalLight(0xf0f6ff,3.4); light.position.set(-4,6,5)
    const rimLight = new THREE.DirectionalLight(0x6e9be8,2.3); rimLight.position.set(5,-2,-4)
    scene.add(light,rimLight,new THREE.AmbientLight(0xe7efff,.3))

    let mobile = smallScreen()
    let maxScroll = 1
    let points: Pose[] = []
    let frame = 0
    let last = 0
    let elapsed = 0
    let visible = true
    const scrolling = { progress: 0 }
    const pointer = { x: 0, y: 0 }
    function waypoint(selector: string, fraction: number, values: number[]): Pose {
      const element = document.querySelector<HTMLElement>(selector)
      const at = element ? element.getBoundingClientRect().top + scrollY + Math.max(0, element.offsetHeight-innerHeight)*fraction : maxScroll
      const [x,y,size,pitch,yaw,bank,opacity] = values
      return { at,x,y,size,pitch,yaw,bank,opacity }
    }
    function measure() {
      maxScroll = Math.max(1,document.documentElement.scrollHeight-innerHeight)
      points = [
        { at:0,x:.23,y:-.055,size:.83,pitch:.48,yaw:-.9,bank:-.18,opacity:1 },
        {at:innerHeight*.85,x:.27,y:.06,size:.63,pitch:.42,yaw:-1.5,bank:.16,opacity:1},
        waypoint('#about',.2,[-.34,.12,.48,.5,-2.2,.25,.65]),
        waypoint('#stack',.12,[.37,.1,.52,.35,-3.1,-.15,.72]),
        waypoint('#stack',.9,[.36,-.15,.4,.6,-3.8,.2,.6]),
        waypoint('#projects',0,[0,-.02,.82,.55,-4.5,-.18,.8]),
        waypoint('#project-gallery',0,[-.36,.18,.5,.5,-5.4,.16,.8]),
        waypoint('#project-gallery',1,[.35,.18,.42,.28,-6.4,-.25,.75]),
        waypoint('#open-source',.2,[-.34,.18,.45,.4,-7.3,.2,.65]),
        waypoint('#journey',.2,[.36,.15,.46,.5,-8.1,-.2,.5]),
        waypoint('#github',.2,[-.36,.16,.45,.42,-8.8,.2,.7]),
        waypoint('#contact',.25,[.34,.15,.5,.45,-9.5,-.15,.65]),
        { at:maxScroll,x:.56,y:.3,size:.25,pitch:.3,yaw:-10,bank:-.3,opacity:.25 },
      ].sort((a,b)=>a.at-b.at)
    }
    function render() {
      if (disposed || !points.length) return
      const position = motion.matches ? scrollY : scrolling.progress*maxScroll
      let index = 0
      while (index<points.length-2 && position>points[index+1].at) index++
      const a=points[index],b=points[index+1]
      let t = THREE.MathUtils.clamp((position-a.at)/Math.max(1,b.at-a.at),0,1)
      t=motion.matches ? 0 : t*t*(3-2*t)
      const value = (key: Exclude<keyof Pose,'at'>) => THREE.MathUtils.lerp(a[key],b[key],t)
      const viewHeight = 2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z
      const viewWidth = viewHeight*camera.aspect
      const size = value('size') * (mobile ? Math.min(.7,viewWidth/8) : Math.min(1.1,viewHeight/7.5))
      aircraft.scale.setScalar(size)
      aircraft.position.set(mobile ? value('x')*viewWidth*.35 : value('x')*viewWidth,value('y')*viewHeight + (motion.matches ? 0 : Math.sin(elapsed*.45)*.035),0)
      aircraft.rotation.set(value('pitch'),value('yaw'),value('bank'))
      node.style.opacity = String(mobile && position>innerHeight ? value('opacity')*.65 : value('opacity'))
      particleMaterial.uniforms.uTime.value = elapsed
      particleMaterial.uniforms.uRatio.value = renderer.getPixelRatio()
      particleMaterial.uniforms.uPointer.value.set(pointer.x,pointer.y)
      particles.rotation.z = scrolling.progress*.12
      renderer.render(scene,camera)
    }
    function animate(time: number) {
      frame=0
      if(disposed||!visible||document.hidden) return
      const delta=last ? Math.min((time-last)/1000,.05):0
      if(time-last>=(mobile ? 1000/30:1000/60)) {
        if(!props.paused&&!motion.matches) elapsed+=delta
        last=time; render()
      }
      if(!motion.matches) frame=requestAnimationFrame(animate)
    }
    function sync() {
      if(frame) cancelAnimationFrame(frame)
      frame=0;last=0
      if(visible&&!document.hidden) {render(); if(!motion.matches) frame=requestAnimationFrame(animate)}
    }
    function resize() {
      mobile=smallScreen()
      renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.75))
      camera.aspect=node.clientWidth/node.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(node.clientWidth,node.clientHeight,false)
      measure();render()
    }
    const media=gsap.matchMedia()
    releases.push(()=>media.revert())
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      const tween=gsap.to(scrolling,{progress:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.7,onRefresh:measure}})
      return ()=>tween.kill()
    })
    const onPointer=(event:PointerEvent)=>{if(!mobile&&!motion.matches) {pointer.x=event.clientX/innerWidth-.5;pointer.y=event.clientY/innerHeight-.5}}
    const onScroll=()=>{if(motion.matches) render()}
    document.addEventListener('pointermove',onPointer,{passive:true})
    document.addEventListener('scroll',onScroll,{passive:true})
    document.addEventListener('visibilitychange',sync)
    motion.addEventListener('change',sync)
    releases.push(()=>{document.removeEventListener('pointermove',onPointer);document.removeEventListener('scroll',onScroll);document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',sync)})
    const observer=new ResizeObserver(resize);observer.observe(node)
    releases.push(()=>observer.disconnect())
    const lost=(event:Event)=>{event.preventDefault();visible=false;ready.value=false;emit('ready',false);sync()}
    const restored=()=>{visible=true;resize();ready.value=true;emit('ready',true);sync()}
    renderer.domElement.addEventListener('webglcontextlost',lost)
    renderer.domElement.addEventListener('webglcontextrestored',restored)
    releases.push(()=>{renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.removeEventListener('webglcontextrestored',restored);if(frame) cancelAnimationFrame(frame)})
    resize();ready.value=true;emit('ready',true);sync()
    void document.fonts.ready.then(()=>{if(!disposed) ScrollTrigger.refresh()})
    // The local GLB replaces the procedural loading fallback once its texture is ready.
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    const gltf = await new GLTFLoader().loadAsync('/models/a350.glb')
    const materials = new Set<Material>()
    const geometries = new Set<BufferGeometry>()
    const textures = new Set<InstanceType<typeof THREE.Texture>>()
    gltf.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      geometries.add(object.geometry)
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(material)
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value)
        if (material instanceof THREE.MeshStandardMaterial) { material.metalness = .38; material.roughness = .3; material.envMapIntensity = .8 }
      }
    })
    const releaseModel = () => { geometries.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose()); textures.forEach(t=>t.dispose()) }
    if (disposed) { releaseModel(); return }
    releases.push(releaseModel)
    gltf.scene.rotation.y = -Math.PI/2
    gltf.scene.updateMatrixWorld(true)
    const bounds = new THREE.Box3().setFromObject(gltf.scene)
    const center = bounds.getCenter(new THREE.Vector3())
    const dimensions = bounds.getSize(new THREE.Vector3())
    const holder = new THREE.Group()
    gltf.scene.position.sub(center)
    holder.add(gltf.scene)
    holder.scale.setScalar(6.8/dimensions.z)
    aircraft.clear(); aircraft.add(holder)
    node.dataset.model = 'a350'
    render()
  } catch {
    cleanup?.();ready.value=false;emit('ready',false)
  }
})
onUnmounted(()=>{disposed=true;cleanup?.()})
</script>

<template>
  <div ref="container" class="flight-scene" :class="{'is-ready':ready}" aria-hidden="true">
    <svg class="flight-fallback" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="aircraft-fallback-metal"><stop stop-color="#617992"/><stop offset=".48" stop-color="#d1dce9"/><stop offset="1" stop-color="#3b506a"/></linearGradient></defs><path d="M289 65Q300 40 311 65L321 236L519 385L520 412L319 341L314 471L377 527L377 548L300 520L223 548L223 527L286 471L281 341L80 412L81 385L279 236Z" fill="url(#aircraft-fallback-metal)"/><path d="M286 128Q300 120 314 128L315 146H285Z" fill="#14263d"/></svg>
  </div>
</template>

<style scoped>
.flight-scene { position: fixed; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
.flight-scene :deep(canvas) { width: 100%; height: 100%; display: block; opacity: 0; transition: opacity .7s; }
.flight-scene.is-ready :deep(canvas) { opacity: 1; }
.flight-fallback { position: absolute; width: min(65vw,800px); left: 50%; top: 51%; transform: translate(-50%,-50%) rotate(-30deg); opacity: .7; transition: opacity .7s; }
.is-ready .flight-fallback { opacity: 0; }
@media (max-width:899px) { .flight-fallback { width: 95vw; } }
@media (prefers-reduced-motion:reduce) { .flight-scene :deep(canvas),.flight-fallback { transition: none; } }
</style>
