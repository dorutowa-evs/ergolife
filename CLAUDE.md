# CLAUDE.md

## Project Overview

**ErgoLife** — 办公椅筛选与对比网站（桌面端 PoC）。
用户可以筛选、对比、查看详情，并通过推荐算法找到最适合自己的椅子。

Tech stack: Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Vitest

---

## Design Context

### Users

居家办公人群（work-from-home consumers）。他们在家独立做购买决策，对人体工学有一定关注但不是专家。核心任务是：快速缩小候选范围 → 横向比较几把椅子 → 找到最适合自己身体的那把。他们希望感到被引导，而不是被参数淹没。

目标设备：**桌面优先，兼顾移动端**。核心体验在桌面端打磨，移动端可用即可。

### Brand Personality

**简洁 · 轻盈 · 现代**

语气克制、不夸张。像一本好的消费指南——客观、可信、排版干净。不是电商促销风，不是极客测评风。

这是一个**正式产品**，不是 PoC，设计决策需考虑长期可维护性和扩展性。

### Aesthetic Direction

- **色调**：白色系。页面背景纯白（`bg-page` = `oklch(1 0 0)`），卡片/面板白色 + `shadow-sm` 区分层次，主文字 `gray-950`
- **字体**：标题用 Playfair Display（`font-display`，editorial 感）；正文用 Geist Sans；层次靠字重和尺寸区分，不靠颜色堆砌
- **圆角**：适度——输入框 `rounded-md`，卡片 `rounded-xl`，图片区域 `rounded-xl`。不用 `rounded-none` 做极简，也不过度圆润
- **间距**：宽松，留白是设计的一部分
- **主色**：黑色（`gray-950`）做强调，`gray-700` 做次级选中态，灰色做辅助，accent 极少使用
- **反参考**：避免电商大促风（大红大绿、闪烁 badge、密集信息堆砌）

### Design Principles

1. **少即是多** — 只展示当前决策所需的信息。隐藏次要内容，而不是缩小字号塞进去。
2. **层次靠留白** — 用 padding/margin 建立视觉节奏，而不是靠分割线或边框划分区域。
3. **文字不加粗** — 除标题外，正文和数据值使用 normal weight，用尺寸而非粗细区分主次。
4. **容器对齐** — 所有页面主容器统一 `max-w-7xl mx-auto px-6`，与导航栏 logo 左边对齐。
5. **交互克制** — hover 效果微妙（颜色过渡），不用弹跳、缩放等夸张动效。
6. **延迟提交** — 筛选等批量操作提供明确的提交按钮（如"检索"），避免每次交互都触发 API 调用。
