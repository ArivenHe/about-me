export type Project = {
  id: string
  number: string
  name: string
  eyebrow: string
  description: string
  status: string
  tags: string[]
  visual: 'aerion' | 'system' | 'publish' | 'vision' | 'knowledge'
  repository?: string
  demo?: string
  featured?: boolean
  impact?: string
  statement?: string
}

export const profile = {
  name: 'Ariven',
  chineseName: '何治皓',
  title: 'Developer & Open Source Builder',
  organization: 'JMI-OPENATOM',
  organizationUrl: 'https://github.com/jmi-openatom',
  communityUrl: 'https://www.jmi-openatom.cn',
  personalGithub: 'https://github.com/ArivenHe',
  email: 'ariven0312@gmail.com',
  blog: '',
}

export const roles = [
  'Full Stack Developer',
  'Open Source Builder',
  'AI Explorer',
  'OpenHarmony Developer',
]

export const projects: Project[] = [
  {
    id: 'aerionstudio',
    number: '01',
    name: 'AerionStudio',
    eyebrow: 'FLIGHT SIMULATION INFRASTRUCTURE / FEATURED',
    description: '面向模拟飞行社区的一体化服务生态，连接联飞服务器、语音通信、玩家客户端与社团管理平台。正在为中国民航大学模拟飞行社团提供技术支持和服务。',
    statement: 'Building the infrastructure behind virtual aviation communities.',
    impact: '真实社区 · 真实服务器 · 持续部署与维护',
    status: 'Private / In Production',
    tags: ['Flight Simulation', 'Multiplayer', 'Voice', 'Client', 'SaaS', 'Infrastructure'],
    visual: 'aerion',
    featured: true,
  },
  {
    id: 'openatom-system',
    number: '02',
    name: 'OpenAtom System',
    eyebrow: 'CAMPUS PLATFORM / FEATURED',
    description: '把社团的成员、活动、表单与权限连接成一个持续生长的数字平台。正在从功能建设走向更清晰的系统架构。',
    status: '持续迭代',
    tags: ['Vue 3', 'TypeScript', 'Spring Boot', 'MySQL', 'Redis'],
    visual: 'system',
    repository: 'https://github.com/jmi-openatom/openatom-system',
    featured: true,
  },
  {
    id: 'publish-site',
    number: '03',
    name: 'OpenAtom Publish Site',
    eyebrow: 'DEVELOPER TOOL / PLATFORM',
    description: '面向学生开发者的网站发布平台，探索从代码仓库到构建、域名与上线的完整链路。',
    status: '开发中',
    tags: ['Vue 3', 'Spring Boot', 'OAuth', 'CI/CD'],
    visual: 'publish',
    repository: 'https://github.com/jmi-openatom/openatom-site-publish-platform',
  },
  {
    id: 'ai-vision',
    number: '04',
    name: 'AI / Computer Vision',
    eyebrow: 'EXPLORATION / MODEL TO DEVICE',
    description: '从数据集标注、模型训练与验证，到 ONNX 导出和摄像头实时推理，持续探索视觉模型的落地方式。',
    status: '持续探索',
    tags: ['Python', 'YOLO', 'ONNX', 'OpenCV'],
    visual: 'vision',
  },
  {
    id: 'knowledge-os',
    number: '05',
    name: 'Local AI Knowledge OS',
    eyebrow: 'DESKTOP / KNOWLEDGE SYSTEM',
    description: '围绕本地资料管理、全文检索和 RAG 问答，探索桌面端知识系统的产品形态。',
    status: '开发中',
    tags: ['Electron', 'Spring Boot', 'RAG', 'Search'],
    visual: 'knowledge',
    repository: 'https://github.com/jmi-openatom/openatom-knowledge-os',
  },
]

export const stack = [
  {
    label: 'Frontend',
    index: '01',
    description: '构建清晰、可交互的 Web 产品界面。',
    items: ['Vue 3', 'TypeScript', 'Vite', 'GSAP', 'Three.js', 'UniApp'],
  },
  {
    label: 'Backend',
    index: '02',
    description: '连接服务、数据与业务流程。',
    items: ['Java', 'Spring Boot', 'MyBatis-Plus', 'MySQL', 'Redis', 'REST API'],
  },
  {
    label: 'AI & Vision',
    index: '03',
    description: '让模型从实验走向真实场景。',
    items: ['Python', 'YOLO', 'Ultralytics', 'ONNX', 'OpenCV'],
  },
  {
    label: 'OpenHarmony',
    index: '04',
    description: '探索应用开发与端侧能力。',
    items: ['ArkTS', 'ArkUI', 'Stage', 'Ability', 'MindSpore Lite'],
  },
  {
    label: 'Infrastructure',
    index: '05',
    description: '让项目可以持续构建、交付和运行。',
    items: ['Docker', 'Linux', 'Nginx', 'GitHub Actions', 'CI/CD'],
  },
]

export const publicRepositories = [
  { name: 'openatom-system', detail: '社团综合管理平台', url: 'https://github.com/jmi-openatom/openatom-system' },
  { name: 'openatom-site-publish-platform', detail: '网站发布平台', url: 'https://github.com/jmi-openatom/openatom-site-publish-platform' },
  { name: 'openatom-knowledge-os', detail: 'AI 知识系统', url: 'https://github.com/jmi-openatom/openatom-knowledge-os' },
]
