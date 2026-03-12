# 椅子详情页设计文档

日期：2026-03-12
状态：已确认

---

## 1. 页面目标

辅助决策：用户从筛选页带着初步兴趣进入详情页，获取足够信息后决定是否加入对比或购买。

---

## 2. 路由

`/chairs/[id]`

---

## 3. 页面结构

### 3.1 顶部导航

- 使用全局 `Header` 组件（与筛选页一致）
- Logo 点击跳转 `/chairs`，筛选状态由 `localStorage` 自动恢复
- 无独立的「返回」链接

### 3.2 主体区域（左右分栏）

**左侧 — 图片区**

- 展示单张椅子图片
- 架构上预留多图扩展（当前仅单张）
- 图片尺寸与展示方式与筛选页卡片保持一致（`imageFit` 字段控制 cover / contain）

**右侧 — 信息区**

| 元素 | 说明 |
|---|---|
| 椅子名称 | `chair.name`，大标题 |
| 参考价格 | `chair.price`，醒目展示 |
| 平台价格列表 | 淘宝 / 京东 / 拼多多，各一行，显示价格 + 「购买」按钮（置灰不可点） |
| 加入对比按钮 | 主 CTA，点击加入对比列表，停留当前页 |

平台价格数据结构（新增字段）：

```typescript
platformPrices?: {
  taobao?: number
  jd?: number
  pdd?: number
}
```

PoC 阶段数据编造，所有购买按钮 `disabled`，无跳转链接。

### 3.3 下方内容区（全宽）

单个 Section：**规格参数**

- 两列表格：参数名（左）+ 值（右）
- 共 10 项，与对比页参数行一致：
  - 价格、材质、颜色、靠背高度、座高、后仰角度、扶手、头枕、腰靠、腰靠可调节
- 复用 `formatters.ts` 中已有的格式化函数

### 3.4 浮动对比按钮（FAB）

- 复用 `CompareFAB` 组件（与筛选页完全一致）
- 加入对比后 FAB 计数实时更新

---

## 4. 行动路径

| 操作 | 结果 |
|---|---|
| 点击「加入对比」 | 加入对比列表，停留当前页，FAB 计数 +1 |
| 点击「购买」（任一平台） | 无响应（按钮 disabled） |
| 点击 Header Logo | 跳转 `/chairs` |
| 点击 FAB | 跳转 `/compare` |

---

## 5. 数据变更

- `Chair` 类型新增可选字段 `platformPrices?: { taobao?: number; jd?: number; pdd?: number }`
- `chairs.catalog.json` 中为所有椅子编造平台价格数据
- 其余字段复用现有 `Chair` 类型，无结构改动

---

## 6. 组件复用

| 组件 | 来源 | 用途 |
|---|---|---|
| `Header` | `src/components/layout/Header.tsx` | 顶部导航 |
| `CompareFAB` | `src/components/compare/CompareFAB.tsx` | 浮动对比按钮 |
| formatters | `src/lib/formatters.ts` | 参数值格式化 |
