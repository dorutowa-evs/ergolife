# 椅子参数扩展设计文档

日期：2026-03-12
状态：Approved

## 1. 目标

扩充办公椅的参数维度，使筛选页和对比页能覆盖用户选购时真正关心的核心规格。同步精简材质选项，并将头枕从布尔值升级为调节等级。

## 2. 范围

- `src/types/catalog.ts`：Chair 类型、FilterState 类型
- `src/data/chairs.catalog.json`：materials 列表 + 所有椅子数据
- 筛选页（`/chairs`）：新增/更新筛选控件
- 对比页（`/compare`）：更新 PARAMS 参数行

## 3. 数据模型

### 3.1 Chair 类型变更

| 字段 | 变更 | 类型 |
|------|------|------|
| `material` | 值域缩减为 3 种 | `'mesh' \| 'leather' \| 'fabric'` |
| `hasHeadrest` | **删除**，由 `headrestAdjustment` 替代 | — |
| `hasLumbar` | 保留不变 | `boolean` |
| `isLumbarAdjustable` | 保留不变 | `boolean` |
| `headrestAdjustment` | **新增**，`null` 表示无头枕 | `'3D' \| '5D' \| '6D' \| null` |
| `armrestAdjustment` | **新增**，`null` 表示无扶手 | `'3D' \| '4D' \| '5D' \| '6D' \| '7D' \| '8D' \| null` |
| `backHeight` | **新增**，单位 cm | `number`（范围 40–70） |
| `seatHeight` | **新增**，单位 cm | `number`（范围 40–55） |
| `recliningAngle` | **新增**，单位度 | `number`（范围 30–160） |

### 3.2 FilterState 变更

| 字段 | 变更 |
|------|------|
| `materials` | 保留，值域缩减为 3 种 |
| `headrest` (TriState) | **删除** |
| `headrestAdjustment` | **新增** `string[]`，可选值：`'none' \| '3D' \| '5D' \| '6D'`，`[]` 表示不限 |
| `armrestAdjustment` | **新增** `string[]`，可选值：`'none' \| '3D' \| '4D' \| '5D' \| '6D' \| '7D' \| '8D'`，`[]` 表示不限 |
| `backHeightMin` / `backHeightMax` | **新增** `number`，默认 40 / 70 |
| `seatHeightMin` / `seatHeightMax` | **新增** `number`，默认 40 / 55 |
| `recliningAngleMin` / `recliningAngleMax` | **新增** `number`，默认 30 / 160 |

### 3.3 Materials 列表

精简为三条：

| id | label |
|----|-------|
| `mesh` | 网布 |
| `leather` | 皮质 |
| `fabric` | 布艺 |

删除 `genuine-leather`、`plastic`。

### 3.4 旧材质 ID 迁移规则

| 旧 ID | 新 ID |
|-------|-------|
| `mesh` | `mesh` |
| `leather` | `leather` |
| `genuine-leather` | `leather` |
| `fabric` | `fabric` |
| `plastic` | `mesh` |

## 4. Catalog 数据更新

所有椅子补充新字段，数值为合理范围内编造（PoC）：

| 字段 | 编造范围 |
|------|---------|
| `backHeight` | 45–68 cm |
| `seatHeight` | 41–54 cm |
| `recliningAngle` | 90–150° |
| `armrestAdjustment` | `3D`–`8D` 随机，约 10% 为 `null`（无扶手） |
| `headrestAdjustment` | `3D` / `5D` / `6D` / `null`，原 `hasHeadrest: false` 的椅子保持 `null` |

## 5. 筛选页 UI

### 5.1 筛选面板字段顺序

1. 价格（已有，双端滑条）
2. 材质（已有，Checkbox，简化为 3 项）
3. 靠背高度（新增，双端滑条，40–70 cm）
4. 座高（新增，双端滑条，40–55 cm）
5. 后仰角度（新增，双端滑条，30–160°）
6. 扶手（新增，圆角方块多选）
7. 头枕（更新，圆角方块多选，替换原三态按钮组）
8. 腰靠（已有，三态按钮组）
9. 腰靠可调节（已有，三态按钮组）

### 5.2 圆角方块多选控件规格

适用于**扶手**和**头枕**两个字段：

- 排列方式：3 列网格，圆角矩形方块
- 每块显示选项文字（`无` / `3D` / `4D` 等），居中
- 多选，选中态：深色边框 + 轻背景色
- 未选任何选项 = 不限
- 底部显示"显示全部 / 收起"（扶手选项较多时）

**扶手**选项（7 个）：`无 / 3D / 4D / 5D / 6D / 7D / 8D`

**头枕**选项（4 个）：`无 / 3D / 5D / 6D`

### 5.3 新增滑条规格

样式与现有价格滑条一致：双端拖拽，滑条下方显示当前区间数值，带单位（cm / °）。

## 6. 对比页参数行

PARAMS 顺序（共 10 行）：

| # | 标签 | 示例值 |
|---|------|--------|
| 1 | 价格 | `¥1,999` |
| 2 | 材质 | 网布 |
| 3 | 颜色 | 黑色 |
| 4 | 靠背高度 | `65 cm` |
| 5 | 座高 | `48 cm` |
| 6 | 后仰角度 | `135°` |
| 7 | 扶手 | `4D` / `无` |
| 8 | 头枕 | `3D` / `无` |
| 9 | 腰靠 | ✓ 有 / ✗ 无 |
| 10 | 腰靠可调节 | ✓ 有 / ✗ 无 |

原"头枕"布尔行删除，由新"头枕"行（显示调节等级）替代。

## 7. 命名约定

UI 标签统一：
- `armrestAdjustment` 字段 → 显示为**扶手**
- `headrestAdjustment` 字段 → 显示为**头枕**
- `backHeight` → **靠背高度**
- `seatHeight` → **座高**
- `recliningAngle` → **后仰角度**
