# about-me

**Ariven / 何治皓的个人主页与项目作品集。**

Developer & Open Source Builder — 保持好奇，持续构建。

以简洁的排版、明暗章节和滚动叙事，呈现个人介绍、技术能力、实践项目与开源社区经历。使用 Vue 3、TypeScript 和 Vite 构建，结合 GSAP 动画、Three.js 飞机场景与液态玻璃交互。

[GitHub](https://github.com/ArivenHe) · [JMI-OPENATOM](https://github.com/jmi-openatom) · [开源社团](https://www.jmi-openatom.cn)

## 页面内容

- **个人介绍**：开发方向、学习理念与个人经历。
- **技术能力**：Frontend、Backend、AI & Vision、OpenHarmony、Infrastructure。
- **精选项目**：桌面端滚动驱动的横向展廊，支持按钮与方向键切换；移动端支持横向滚动。
- **开源社区**：JMI-OPENATOM 社团介绍、公开仓库与社区入口。
- **学习旅程与联系**：持续探索的方向、GitHub 与邮件联系方式。

页面包含随滚动变化的 A350 飞机场景、粒子背景与液态玻璃控件，支持响应式布局、系统减少动态效果偏好，以及飞机浮动暂停。WebGL 场景加载失败时显示 SVG 飞机。

## 展示项目

| 项目 | 方向 | 当前展示状态 |
| --- | --- | --- |
| AerionStudio | 模拟飞行联飞服务器、语音通信、玩家客户端与社团管理平台 | Private / In Production |
| OpenAtom System | 社团综合管理平台 | 持续迭代 |
| OpenAtom Publish Site | 从代码仓库到构建与上线的网站发布平台 | 开发中 |
| AI / Computer Vision | 数据标注、模型训练、ONNX 导出与实时推理 | 持续探索 |
| Local AI Knowledge OS | 本地资料管理、全文检索与 RAG 问答 | 开发中 |

此仓库包含个人主页的前端代码。上述项目通过介绍与链接展示，实际源码由对应项目仓库维护。

## 技术栈

| 用途 | 技术 |
| --- | --- |
| 页面与路由 | Vue 3 Composition API、Vue Router |
| 类型与构建 | TypeScript、Vite、vue-tsc |
| 滚动与动效 | GSAP、ScrollTrigger |
| 3D 场景 | Three.js、GLTFLoader |
| 图标与玻璃效果 | Lucide Vue、simple-liquid-glass |
| 样式 | 原生 CSS、响应式媒体查询 |

## 本地运行

建议使用 **Node.js 22.12+ 或 Node.js 24**，并安装 npm。

```bash
git clone git@github.com:ArivenHe/about-me.git
cd about-me
npm ci
npm run dev
```

打开终端显示的本地地址，默认是 `http://localhost:5173`。

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run typecheck` | 检查 TypeScript 与 Vue 类型 |
| `npm run build` | 执行类型检查、生成生产文件并按配置生成 sitemap |
| `npm run preview` | 在本地预览生产构建，默认端口为 4173 |

## 修改内容

主要资料集中在 [`src/data/site.ts`](src/data/site.ts)：

- `profile`：姓名、组织、GitHub 和邮件地址。
- `projects`：项目介绍、状态、标签、仓库与演示链接。
- `stack`：技术能力分类。
- `publicRepositories`：公开仓库列表。

页面章节与学习旅程文案位于 [`src/views/HomeView.vue`](src/views/HomeView.vue)，首屏文案位于 [`src/components/SculpturalHero.vue`](src/components/SculpturalHero.vue)。头像文件为 [`public/ariven-avatar.jpg`](public/ariven-avatar.jpg)，网页标题、描述、分享元信息和 favicon 在 [`index.html`](index.html) 中配置。

## 项目结构

```text
about-me/
├── public/
│   ├── ariven-avatar.jpg       # 头像与品牌图片
│   ├── models/                 # A350 模型、署名页与许可说明
│   └── robots.txt
├── scripts/
│   └── generate-sitemap.mjs    # 构建时生成 sitemap 与 robots 配置
├── src/
│   ├── components/             # 首屏、项目视觉、飞机与玻璃组件
│   ├── data/site.ts            # 个人资料与项目数据
│   ├── views/HomeView.vue      # 主页章节与滚动交互
│   ├── artwork.css             # 项目视觉样式
│   ├── styles.css              # 全局与响应式样式
│   ├── App.vue
│   └── main.ts                 # 应用与路由入口
├── index.html                  # HTML 入口与 SEO 元信息
└── vite.config.ts
```

## 构建与部署

```bash
npm run build
npm run preview
```

构建产物位于 `dist/`，可发布到静态网站托管服务或 Nginx。

配置正式站点地址后，构建脚本会生成 `dist/sitemap.xml`，并更新构建产物中的 `robots.txt`。以下地址仅为示例，请替换为自己的域名：

```bash
SITE_URL=https://example.com npm run build
```

未配置 `SITE_URL` 时，构建仍会成功，跳过 sitemap 生成并保留默认 robots 文件。

当前静态资源使用站点根路径，建议部署在独立域名的根目录。若使用 GitHub Pages 的 `/about-me/` 子路径，需要同时调整 Vite 的 `base` 和代码中的静态资源根路径。使用 History 路由的托管服务应将页面路径回退至 `index.html`；Nginx 可使用：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 第三方资源与署名

- **A350 无标识模型**：来自 [amvlab / aircraft-models](https://github.com/amvlab/aircraft-models)，原始文件为 `models/A350_nologo.glb`，按 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权。本项目保留模型文件，在场景中调整比例、方向、材质参数与灯光，并添加滚动驱动的飞行轨迹。详见 [`public/models/LICENSE-aircraft.txt`](public/models/LICENSE-aircraft.txt) 和 [`public/models/credits.html`](public/models/credits.html)。
- **液态玻璃效果**：使用 [simple-liquid-glass](https://github.com/lucaperullo/simple-liquid-glass)。
- **图标**：使用 [Lucide](https://github.com/lucide-icons/lucide)。

## 许可证

本项目原创代码与文档采用 [MIT License](LICENSE)，版权归 Ariven / 何治皓所有。

第三方代码与资源遵循各自的许可证，其中 A350 模型继续按 CC BY 4.0 授权；使用或分发时请保留相应许可与署名。
